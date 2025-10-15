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
import { CheckCircle, Copy, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { useToast } from "@/hooks/dashboardRelated/calendar/use-toast";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderResult: {
    data: {
      url: string;
      sessionId: string;
    };
  };
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderResult,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(orderResult.data.url);
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
    window.open(orderResult.data.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Order Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Your order has been created. Complete the payment to confirm your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session ID:</span>
                <Badge variant="outline">{orderResult.data.sessionId}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="secondary">Pending Payment</Badge>
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
                  {orderResult.data.url}
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
                  Open Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Share this payment link with your customer</p>
                <p>• Payment must be completed to confirm the booking</p>
                <p>• Calendar events will be created after successful payment</p>
                <p>• You can track the order status in the Orders page</p>
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
