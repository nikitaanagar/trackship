const hasTwilioCreds = process.env.TWILIO_ACCOUNT_SID && 
                       !process.env.TWILIO_ACCOUNT_SID.startsWith('mock') && 
                       process.env.TWILIO_AUTH_TOKEN && 
                       !process.env.TWILIO_AUTH_TOKEN.startsWith('mock') && 
                       process.env.TWILIO_PHONE_NUMBER && 
                       !process.env.TWILIO_PHONE_NUMBER.startsWith('mock');

let client;

if (hasTwilioCreds) {
  try {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.error(`Failed to load twilio module: ${error.message}`);
  }
}

const sendSMS = async (to, message) => {
  if (!client) {
    console.log('\n=================== MOCK SMS OUTBOX ===================');
    console.log(`To:      ${to}`);
    console.log(`Msg:     ${message}`);
    console.log('=======================================================\n');
    return { mock: true, sid: 'mock-sms-sid-' + Math.random().toString(36).substring(7) };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`SMS sent successfully. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error(`Error sending SMS via Twilio: ${error.message}`);
    // Safe-fail by logging and continuing
    return { error: true, message: error.message };
  }
};

module.exports = { sendSMS };
