import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Globe, Server } from "lucide-react";

export default function Security() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Security & Trust</h1>
        <Badge className="bg-blue-100 text-blue-800">
          Enterprise-Grade Security
        </Badge>
      </div>

      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          FinApp meets SOC 2 Type II and ISO 27001 security standards for financial data protection.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Data Encryption
                </h4>
                <p className="text-gray-600">End-to-end encryption for all financial data and communications.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Authentication
                </h4>
                <p className="text-gray-600">Multi-factor authentication and secure session management.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Infrastructure
                </h4>
                <p className="text-gray-600">Cloud infrastructure with automated security monitoring.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Compliance
                </h4>
                <p className="text-gray-600">GDPR, CCPA, and financial industry compliance standards.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Regular Security Audits</h4>
                  <p className="text-gray-600">Third-party security assessments and penetration testing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Zero-Trust Architecture</h4>
                  <p className="text-gray-600">Every access request is verified and authenticated.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Incident Response</h4>
                  <p className="text-gray-600">24/7 security monitoring and rapid incident response.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Security Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you discover a security vulnerability, please report it responsibly to our security team.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Email: security@finapp.com | Response time: Within 24 hours
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}