import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { AcademyStore } from '../services/storage';
import { notifyContactInquiry } from '../services/formspree';
import { WhatsAppIcon, WHATSAPP_DEFAULT_URL, WHATSAPP_PHONE } from '../components/WhatsAppButton';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Course Consultation');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    notifyContactInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      inquirySource: 'Fluentia Academy Contact Us Page',
    });

    AcademyStore.addAuditLog({
      action: 'SUPPORT_INQUIRY_RECEIVED',
      performedBy: `${name} (${email})`,
      userRole: 'guest',
      targetEntity: `Inquiry: ${subject}`,
      details: `Phone: ${phone || 'N/A'}. Message: ${message.slice(0, 100)}...`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
          Direct Admissions & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D382B] mt-1">
          Contact Fluentia Academy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Have questions about course placement, group schedules, or 1-on-1 mentor availability? Our academic counseling team in Cairo is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0D382B] text-white p-8 rounded-2xl space-y-6 shadow-md border border-[#184D3C]">
            <h3 className="text-lg font-serif font-bold text-white">Academic Headquarters</h3>

            <div className="space-y-4 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A5C2AE] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Academy Location:</p>
                  <p className="mt-0.5">Online · New Alamein, Egypt</p>
                  <p className="mt-0.5 text-slate-300">Serving Egyptian & International Learners Globally</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#A5C2AE] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Admissions & Placement:</p>
                  <p className="font-mono">fluentia.academy.edu@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#A5C2AE] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Direct Phone / WhatsApp:</p>
                  <p className="font-mono tabular-nums">+20 1 20 57 9 3 4 20</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#A5C2AE] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Office Hours:</p>
                  <p>Sunday – Thursday: 10:00 AM – 9:00 PM CLT</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA Card */}
            <div className="pt-5 border-t border-[#184D3C] space-y-2.5">
              <span className="text-[11px] font-semibold text-[#A5C2AE] uppercase tracking-wider block">
                Instant WhatsApp Messaging
              </span>
              <a
                href={WHATSAPP_DEFAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
              <p className="text-[11px] text-slate-300/80 text-center">
                Direct channel to Academy Director Basmala Ahmed for immediate admissions, placement questions, and fee payments.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#E3DFD3] shadow-sm">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Inquiry Dispatched Successfully</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                Thank you, <span className="font-semibold text-slate-900">{name}</span>. An academic advisor will reach out to <span className="font-semibold text-slate-900">{email}</span> within 24 business hours to assist you.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-[#0D382B]">Send an Inquiry or Placement Request</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmed Farouk"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmed@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Inquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  >
                    <option value="Course Consultation">Course Consultation (A1–B2)</option>
                    <option value="Speaking Club Registration">Speaking Club Inquiries</option>
                    <option value="1-on-1 Mentorship Booking">1-on-1 Private Mentorship</option>
                    <option value="Teacher Application Inquiry">Faculty & Teacher Application</option>
                    <option value="Corporate English Training">Corporate Team Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Your Message or Learning Goals</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your current English challenges, work requirements, or target exam dates..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry to Academic Advisors</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
