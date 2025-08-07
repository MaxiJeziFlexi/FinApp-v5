import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Loader } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from "@/lib/queryClient";
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planData }: { planData: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/finapp-home?payment=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Welcome to FinApp ${planData.name}! Redirecting to your dashboard...`,
      });
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold py-3"
      >
        {isProcessing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${planData.price}/month
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [location] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planData, setPlanData] = useState<any>(null);
  const { toast } = useToast();

  // Get plan from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedPlan = urlParams.get('plan') || 'pro';

  const plans = {
    pro: {
      name: 'Pro',
      price: 29,
      originalPrice: 41,
      description: 'Advanced AI financial advisor with premium features',
      features: [
        'Advanced AI financial advisor',
        'Tax optimization strategies', 
        'Real-time market intelligence',
        'Priority customer support',
        '5 AI advisor sessions/month'
      ],
      savings: '$12/month until Nov 2025'
    },
    max: {
      name: 'Max',
      price: 99,
      originalPrice: 129,
      description: 'Unlimited access to all FinApp features',
      features: [
        'Everything in Pro',
        'Unlimited AI advisor sessions',
        'Custom portfolio management',
        'Direct advisor calls',
        'White-label options'
      ],
      savings: '$30/month until Nov 2025'
    }
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans] || plans.pro;

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    setPlanData(currentPlan);
    
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: currentPlan.price,
      planType: selectedPlan,
      description: `FinApp ${currentPlan.name} Subscription`
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Payment intent error:', error);
        toast({
          title: "Payment Setup Error",
          description: "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [selectedPlan]);

  if (!clientSecret || !planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <FloatingElements />
        <Card3D>
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Setting up your payment...</h3>
              <p className="text-gray-600">Please wait while we prepare your checkout.</p>
            </CardContent>
          </Card>
        </Card3D>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <FloatingElements />
      
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card3D>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                </div>
                <CardTitle className="text-2xl text-gray-900">Order Summary</CardTitle>
                <CardDescription>
                  Review your selected plan before completing payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">FinApp {planData.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Special Pricing
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{planData.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {planData.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Monthly Price:</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 line-through">${planData.originalPrice}</span>
                        <span className="text-2xl font-bold text-gray-900 ml-2">${planData.price}</span>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-semibold mt-1 text-right">
                      {planData.savings}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment powered by Stripe • Cancel anytime</span>
                </div>
              </CardContent>
            </Card>
          </Card3D>

          {/* Payment Form */}
          <Card3D>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Payment Details</CardTitle>
                <CardDescription>
                  Complete your subscription to FinApp {planData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm planData={planData} />
                </Elements>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                  <p className="mt-2">Your subscription will auto-renew monthly. Cancel anytime.</p>
                </div>
              </CardContent>
            </Card>
          </Card3D>
        </div>
      </div>
    </div>
  );
}