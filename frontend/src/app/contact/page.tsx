'use client';

import { useState } from 'react';
import Container from '@/components/layout/Container';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

const subjectOptions = [
  { value: '', label: 'Select a subject' },
  { value: 'product', label: 'Product Inquiry' },
  { value: 'order', label: 'Order Question' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'return', label: 'Returns & Refunds' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <Container maxWidth="4xl" className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-gray-700 mb-8">
            We'd love to hear from you! Whether you have a question about our products,
            need help with an order, or just want to say hello, feel free to reach out.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-700">support@peptidestore.com</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-700">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                Saturday: 10:00 AM - 4:00 PM EST<br />
                Sunday: Closed
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-700">
                We typically respond to inquiries within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
          
          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              options={subjectOptions}
              required
            />
            
            <Textarea
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
            />
            
            <Button type="submit" fullWidth>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
}
