export default function handler(req, res) {
  res.status(200).json({
    message: 'Resilient Email Service is running.',
    endpoints: ['/api/send-email', '/api/status/id']
  });
}
