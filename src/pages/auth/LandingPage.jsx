import { Link } from 'react-router-dom';
import { Building2, User, Code2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to CodeAssess</h1>
            <p className="text-gray-600 text-lg">How would you like to continue?</p>
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Business/Recruiter Option */}
            <Link
              to="/login/business"
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Business</h2>
                <p className="text-gray-600 text-sm">
                  I'm a recruiter or hiring manager looking to assess candidates
                </p>
              </div>
            </Link>

            {/* User/Practitioner Option */}
            <Link
              to="/login/user"
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">User</h2>
                <p className="text-gray-600 text-sm">
                  I want to practice coding problems and improve my skills
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
