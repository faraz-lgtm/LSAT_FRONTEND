import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import { CheckCircle, Copy, ExternalLink, CreditCard, LinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/dashboardRelated/calendar/use-toast";

interface PaymentLinkSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentResult: {
    sessionId: string;
    checkoutUrl: string;
  };
}

export const PaymentLinkSuccessModal: React.FC<PaymentLinkSuccessModalProps> = ({
  isOpen,
  onClose,
  paymentResult,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentResult.checkoutUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Payment link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenPayment = () => {
    window.open(paymentResult.checkoutUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Payment Link Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Your payment link has been generated. Share it with your customer to collect payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session ID:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {paymentResult.sessionId.substring(0, 20)}...
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="secondary">Ready for Payment</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md border">
                <p className="text-sm text-muted-foreground break-all font-mono">
                  {paymentResult.checkoutUrl}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-1"
                  disabled={copied}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                
                <Button
                  onClick={handleOpenPayment}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Payment Page
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Share this payment link with your customer via email, SMS, or chat</p>
                <p>• The customer can complete payment through the secure Stripe checkout</p>
                <p>• Payment links expire after 24 hours if not completed</p>
                <p>• You will receive a notification when payment is completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

