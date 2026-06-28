import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, ClipboardList, CheckCircle2, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { createBooking } from '../../services/bookingService';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/paymentService';
import { downloadInvoicePDF } from '../../utils/invoice';
import DemoPaymentGateway from '../../components/common/DemoPaymentGateway';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export const BookParcel = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayData, setGatewayData] = useState(null);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Parcel
    description: '',
    category: 'documents',
    weight: '1',
    length: '',
    width: '',
    height: '',
    paymentMethod: 'online',
    // Step 2: Addresses
    pickupStreet: '',
    pickupCity: '',
    pickupState: '',
    pickupPincode: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientStreet: '',
    recipientCity: '',
    recipientState: '',
    recipientPincode: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Pricing calculations on the client side
  const calculatedPrice = (() => {
    const w = parseFloat(formData.weight) || 0;
    const p1 = parseInt(formData.pickupPincode) || 110001;
    const p2 = parseInt(formData.recipientPincode) || 400001;
    const diff = Math.abs(p1 - p2);
    const distance = Math.max(50, Math.min(1500, (diff % 1450) + 50));
    
    const basePrice = 50;
    const weightPrice = 10 * w;
    const distancePrice = 5 * (distance / 100);
    return Math.round(basePrice + weightPrice + distancePrice);
  })();

  const validateStep = () => {
    const err = {};
    if (step === 1) {
      if (!formData.description) err.description = 'Parcel description is required';
      if (!formData.weight) err.weight = 'Weight is required';
      else if (parseFloat(formData.weight) <= 0) err.weight = 'Weight must be greater than 0';
    } else if (step === 2) {
      if (!formData.pickupStreet) err.pickupStreet = 'Pickup street is required';
      if (!formData.pickupCity) err.pickupCity = 'Pickup city is required';
      if (!formData.pickupState) err.pickupState = 'Pickup state is required';
      if (!formData.pickupPincode) err.pickupPincode = 'Pickup pincode is required';
      else if (!/^\d{6}$/.test(formData.pickupPincode)) err.pickupPincode = 'Invalid pincode format (6 digits)';

      if (!formData.recipientName) err.recipientName = 'Recipient name is required';
      if (!formData.recipientPhone) err.recipientPhone = 'Recipient phone is required';
      else if (!/^\d{10}$/.test(formData.recipientPhone)) err.recipientPhone = 'Phone must be a 10-digit number';
      if (!formData.recipientEmail) err.recipientEmail = 'Recipient email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) err.recipientEmail = 'Email is invalid';

      if (!formData.recipientStreet) err.recipientStreet = 'Delivery street is required';
      if (!formData.recipientCity) err.recipientCity = 'Delivery city is required';
      if (!formData.recipientState) err.recipientState = 'Delivery state is required';
      if (!formData.recipientPincode) err.recipientPincode = 'Delivery pincode is required';
      else if (!/^\d{6}$/.test(formData.recipientPincode)) err.recipientPincode = 'Invalid pincode format (6 digits)';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Dynamic script loader for Razorpay Checkout
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      // Append all form inputs
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Create initial pending/POD booking
      const response = await createBooking(data);
      if (!response.success) {
        throw new Error(response.message || 'Booking creation failed');
      }

      const booking = response.data;

      // Check payment routing option
      if (formData.paymentMethod === 'pod') {
        toast.success('Parcel booked successfully (Pay on Delivery)!');
        setSuccessBooking(booking);
        setLoading(false);
        return;
      }

      // Execute Online Payment Flow (Razorpay)
      const orderResponse = await createRazorpayOrder(booking._id);
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Order creation failed');
      }

      const orderData = orderResponse.data;

      // Handle Mock Mode payment simulation (launch dynamic checkout gateway UI modal)
      if (orderData.isMock) {
        setGatewayData({
          amount: booking.payment.amount,
          bookingId: booking._id,
          orderId: orderData.id
        });
        setShowGateway(true);
        setLoading(false);
        return;
      }

      // Load Razorpay & Open real Checkout UI Popup Modal
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment SDK');
      }

      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TrackShip',
        description: 'Courier Booking Payment Receipt',
        order_id: orderData.id,
        handler: async (paymentResponse) => {
          setLoading(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              bookingId: booking._id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature
            });

            if (verifyRes.success) {
              toast.success('Payment Verification Successful!');
              setSuccessBooking(verifyRes.data);
            }
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment checkout cancelled. Please complete payment.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to process booking or payment');
      setLoading(false);
    }
  };

  if (successBooking) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-brand-border text-center space-y-6">
        <CheckCircle2 className="h-16 w-16 text-brand-success mx-auto animate-bounce" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-navy">Parcel Booked!</h2>
          <p className="text-xs text-brand-muted">
            Your dispatch request has been registered and scheduled for pickup.
          </p>
        </div>

        <div className="bg-brand-bg p-4 rounded-xl border border-brand-border space-y-3">
          <p className="text-xs text-brand-muted font-medium">YOUR TRACKING ID</p>
          <p className="text-xl font-bold text-brand-blue font-mono select-all">
            {successBooking.trackingId}
          </p>
        </div>

        {successBooking.qrCode && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-brand-navy">Download QR Code</p>
            <div className="flex justify-center">
              <img
                src={successBooking.qrCode}
                alt="QR Code"
                className="w-48 h-48 border border-brand-border p-2 rounded-lg bg-white"
              />
            </div>
            {/* Download button using direct anchor trick */}
            <a
              href={successBooking.qrCode}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download QR Image
            </a>
          </div>
        )}

        {successBooking.payment.status === 'paid' && (
          <div className="pt-2">
            <button
              onClick={() => downloadInvoicePDF(successBooking)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-success hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer border-0 w-full justify-center"
            >
              <Download className="h-4 w-4" /> Download Tax Invoice (PDF)
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/customer/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate(`/customer/track?id=${successBooking.trackingId}`)}
          >
            Track Parcel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Book a Parcel</h1>
        <p className="text-xs text-brand-muted">Enter parcel details, pickup/delivery address, and confirm billing.</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${step >= 1 ? 'bg-brand-blue text-white' : 'bg-brand-border text-brand-muted'}`}>
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-brand-navy' : 'text-brand-muted'}`}>
            Details
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-brand-border mx-4"></div>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${step >= 2 ? 'bg-brand-blue text-white' : 'bg-brand-border text-brand-muted'}`}>
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? 'text-brand-navy' : 'text-brand-muted'}`}>
            Addresses
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-brand-border mx-4"></div>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${step >= 3 ? 'bg-brand-blue text-white' : 'bg-brand-border text-brand-muted'}`}>
            3
          </div>
          <span className={`text-xs font-semibold ${step >= 3 ? 'text-brand-navy' : 'text-brand-muted'}`}>
            Review
          </span>
        </div>
      </div>

      {/* Forms Panels */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-brand-navy flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-blue" /> Parcel Details
            </h3>

            <Input
              id="description"
              label="Parcel Description"
              placeholder="e.g. Red box with books and clothing items"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-medium text-brand-navy">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
                >
                  <option value="documents">Documents</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="fragile">Fragile items</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                id="weight"
                label="Weight (kg)"
                type="number"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                error={errors.weight}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                id="length"
                label="Length (cm)"
                type="number"
                placeholder="Length"
                value={formData.length}
                onChange={handleInputChange}
              />
              <Input
                id="width"
                label="Width (cm)"
                type="number"
                placeholder="Width"
                value={formData.width}
                onChange={handleInputChange}
              />
              <Input
                id="height"
                label="Height (cm)"
                type="number"
                placeholder="Height"
                value={formData.height}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="parcel-image" className="text-sm font-medium text-brand-navy">
                Parcel Image (Optional)
              </label>
              <input
                id="parcel-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-brand-navy file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-sm font-medium text-brand-navy">Payment Method</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-brand-navy cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                    className="accent-brand-blue h-4 w-4"
                  />
                  <span>Pay Now (Razorpay Online)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-brand-navy cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="paymentMethod"
                    value="pod"
                    checked={formData.paymentMethod === 'pod'}
                    onChange={handleInputChange}
                    className="accent-brand-blue h-4 w-4"
                  />
                  <span>Pay on Delivery (UPI QR)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Pickup details */}
            <div className="space-y-4">
              <h3 className="font-bold text-base text-brand-navy flex items-center gap-2 border-b border-brand-border pb-2">
                <MapPin className="h-5 w-5 text-brand-blue" /> Pickup Address
              </h3>
              <Input
                id="pickupStreet"
                label="Street Address"
                placeholder="123 Sender Road"
                value={formData.pickupStreet}
                onChange={handleInputChange}
                error={errors.pickupStreet}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="pickupCity"
                  label="City"
                  placeholder="City"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  error={errors.pickupCity}
                  required
                />
                <Input
                  id="pickupState"
                  label="State"
                  placeholder="State"
                  value={formData.pickupState}
                  onChange={handleInputChange}
                  error={errors.pickupState}
                  required
                />
                <Input
                  id="pickupPincode"
                  label="Pincode"
                  placeholder="Pincode"
                  value={formData.pickupPincode}
                  onChange={handleInputChange}
                  error={errors.pickupPincode}
                  required
                />
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-base text-brand-navy flex items-center gap-2 border-b border-brand-border pb-2">
                <MapPin className="h-5 w-5 text-brand-success" /> Recipient Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  id="recipientName"
                  label="Name"
                  placeholder="Recipient name"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  error={errors.recipientName}
                  required
                />
                <Input
                  id="recipientPhone"
                  label="Phone"
                  placeholder="Recipient phone"
                  value={formData.recipientPhone}
                  onChange={handleInputChange}
                  error={errors.recipientPhone}
                  required
                />
                <Input
                  id="recipientEmail"
                  label="Email"
                  placeholder="Recipient email"
                  value={formData.recipientEmail}
                  onChange={handleInputChange}
                  error={errors.recipientEmail}
                  required
                />
              </div>

              <Input
                id="recipientStreet"
                label="Delivery Street Address"
                placeholder="456 Recipient Ave"
                value={formData.recipientStreet}
                onChange={handleInputChange}
                error={errors.recipientStreet}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="recipientCity"
                  label="City"
                  placeholder="City"
                  value={formData.recipientCity}
                  onChange={handleInputChange}
                  error={errors.recipientCity}
                  required
                />
                <Input
                  id="recipientState"
                  label="State"
                  placeholder="State"
                  value={formData.recipientState}
                  onChange={handleInputChange}
                  error={errors.recipientState}
                  required
                />
                <Input
                  id="recipientPincode"
                  label="Pincode"
                  placeholder="Pincode"
                  value={formData.recipientPincode}
                  onChange={handleInputChange}
                  error={errors.recipientPincode}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-base text-brand-navy flex items-center gap-2 border-b border-brand-border pb-2">
              <Truck className="h-5 w-5 text-brand-blue" /> Review & Confirm Booking
            </h3>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-brand-navy">
              <div className="space-y-2 bg-brand-bg p-4 rounded-xl border border-brand-border">
                <h4 className="font-bold text-xs text-brand-muted uppercase">Parcel Details</h4>
                <p><strong>Description:</strong> {formData.description}</p>
                <p className="capitalize"><strong>Category:</strong> {formData.category}</p>
                <p><strong>Weight:</strong> {formData.weight} kg</p>
                {formData.length && <p><strong>Dimensions:</strong> {formData.length}x{formData.width}x{formData.height} cm</p>}
                <p><strong>Payment:</strong> {formData.paymentMethod === 'online' ? 'Pay Now (Razorpay Online)' : 'Pay on Delivery (UPI QR)'}</p>
              </div>

              <div className="space-y-2 bg-brand-bg p-4 rounded-xl border border-brand-border">
                <h4 className="font-bold text-xs text-brand-muted uppercase">Pricing Estimation</h4>
                <p className="text-2xl font-bold text-brand-blue mt-2">₹{calculatedPrice}</p>
                <p className="text-[10px] text-brand-muted">
                  Includes base fare ₹50 + ₹10/kg + pincode distance adjustments.
                </p>
                <div className="border-t border-brand-border my-2 pt-2">
                  <p className="text-xs text-brand-navy">
                    Estimated Delivery: <strong>3–5 Days</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-brand-navy">
              <div>
                <h4 className="font-bold text-brand-muted uppercase mb-1">Pickup Address</h4>
                <p className="bg-brand-bg p-3 rounded-lg border border-brand-border">
                  {formData.pickupStreet}, {formData.pickupCity}, {formData.pickupState} - {formData.pickupPincode}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-brand-muted uppercase mb-1">Recipient Address</h4>
                <p className="bg-brand-bg p-3 rounded-lg border border-brand-border">
                  <strong>{formData.recipientName} ({formData.recipientPhone})</strong><br />
                  {formData.recipientStreet}, {formData.recipientCity}, {formData.recipientState} - {formData.recipientPincode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form controls buttons */}
        <div className="flex gap-3 justify-between mt-8 border-t border-brand-border pt-4">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-1.5 ml-auto"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleBookingSubmit}
              loading={loading}
              className="flex items-center gap-1.5 ml-auto"
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </div>

      <DemoPaymentGateway
        isOpen={showGateway}
        amount={gatewayData?.amount || 0}
        bookingId={gatewayData?.bookingId || ''}
        onCancel={() => {
          toast.error('Payment checkout cancelled. Please complete payment.');
          setShowGateway(false);
        }}
        onSuccess={async (paymentDetails) => {
          setShowGateway(false);
          setLoading(true);
          try {
            const verifyRes = await verifyRazorpayPayment({
              bookingId: gatewayData.bookingId,
              razorpayOrderId: paymentDetails.razorpay_order_id,
              razorpayPaymentId: paymentDetails.razorpay_payment_id,
              razorpaySignature: paymentDetails.razorpay_signature
            });

            if (verifyRes.success) {
              toast.success('Online Payment Verified Successfully!');
              setSuccessBooking(verifyRes.data);
            }
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export default BookParcel;
