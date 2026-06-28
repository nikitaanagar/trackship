const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats & Analytical Chart Info
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Stats Row Cards
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
    const activeShipments = await Booking.countDocuments({ 
      status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] } 
    });
    const deliveredCount = await Booking.countDocuments({ status: 'delivered' });
    const registeredUsers = await User.countDocuments();

    // Sum total revenue
    const revenueStats = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = revenueStats[0]?.total || 0;

    // 2. Chart Info: Bookings per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const bookingsPerDay = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$payment.status', 'paid'] }, '$payment.amount', 0] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format chart logs for Recharts
    const bookingsChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const match = bookingsPerDay.find(item => item._id === dateStr);
      bookingsChartData.push({
        date: dateStr,
        bookings: match ? match.count : 0,
        revenue: match ? match.revenue : 0
      });
    }

    // 3. Status distribution (pie chart data)
    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusDistribution = statusCounts.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalBookings,
          todayBookings,
          activeShipments,
          deliveredCount,
          totalRevenue,
          registeredUsers
        },
        charts: {
          bookingsChartData,
          statusDistribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings in system (paginated and filterable)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, agent, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (agent && agent !== 'all') {
      if (agent === 'unassigned') {
        query.assignedAgent = { $exists: false };
      } else {
        query.assignedAgent = agent;
      }
    }

    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
        { 'pickupAddress.city': { $regex: search, $options: 'i' } },
        { 'recipient.address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    
    const count = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit))
      .populate('sender', 'name email phone')
      .populate('assignedAgent', 'name email phone avatar');

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign or reassign an agent to a booking
// @route   PUT /api/admin/bookings/:id/assign-agent
// @access  Private (Admin)
const assignAgent = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('sender', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let agentName = 'Unassigned';
    if (agentId) {
      const agent = await User.findById(agentId);
      if (!agent || agent.role !== 'agent') {
        return res.status(400).json({ success: false, message: 'Invalid agent selection' });
      }
      booking.assignedAgent = agentId;
      agentName = agent.name;
    } else {
      booking.assignedAgent = undefined;
    }

    // Add status logs
    booking.statusLogs.push({
      stage: booking.status,
      message: `Delivery agent updated to: ${agentName}`,
      location: booking.statusLogs[booking.statusLogs.length - 1]?.location || 'Main Dispatch Center',
      updatedBy: req.user._id
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Agent successfully assigned to booking`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in system (filterable)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const roles = ['customer', 'agent', 'admin'];
    if (!roles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${isActive ? 'Active' : 'Inactive'}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytical reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('assignedAgent', 'name');

    // Aggregate statistics
    const totalCount = bookings.length;
    const deliveredCount = bookings.filter(b => b.status === 'delivered').length;
    const failedCount = bookings.filter(b => b.status === 'failed').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings.reduce((sum, b) => b.payment.status === 'paid' ? sum + b.payment.amount : sum, 0);

    const stats = {
      totalBookings: totalCount,
      deliveredPercent: totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0,
      failedPercent: totalCount > 0 ? Math.round((failedCount / totalCount) * 100) : 0,
      cancelledPercent: totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0,
      revenue
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  assignAgent,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getReports
};
