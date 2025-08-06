import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, Database, Globe } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <Badge className="bg-green-100 text-green-800">
          Last updated: December 2024
        </Badge>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Data Protection Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              FinApp is committed to protecting your privacy and financial data. We use industry-standard 
              encryption and security measures to ensure your information remains safe and secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Financial Learning Data</h4>
              <p className="text-gray-600">We collect your learning progress, financial goals, and educational preferences to personalize your AI advisor experience.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Analytics</h4>
              <p className="text-gray-600">Anonymous usage data helps us improve our AI models and educational content for all users.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              How We Protect Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Encryption</h4>
              <p className="text-gray-600">All data is encrypted in transit and at rest using AES-256 encryption.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Access Controls</h4>
              <p className="text-gray-600">Strict access controls ensure only authorized personnel can access user data.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your learning progress</li>
              <li>Opt-out of data collection</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}