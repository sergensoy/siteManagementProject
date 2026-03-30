import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '@/services/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await mockApi.requestPasswordReset(email);
      const link = `${window.location.origin}/reset-password?token=${token}`;
      setResetLink(link);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Şifremi Unuttum</h1>
          <p className="text-muted-foreground mt-1">
            Email adresinize şifre sıfırlama bağlantısı göndereceğiz
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent className="pt-6">
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Şifre sıfırlama bağlantısı email adresinize gönderildi.
                </div>

                {/* Demo: Gerçek backend'de bu gösterilmez, email ile gider */}
                <div className="p-4 rounded-md bg-accent border border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Demo:</strong> Gerçek sistemde bu link email ile gönderilir. Şimdilik aşağıdaki linki kullanabilirsiniz:
                  </p>
                  <a
                    href={resetLink}
                    className="text-xs text-primary underline break-all"
                  >
                    {resetLink}
                  </a>
                </div>

                <Link to="/login">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Giriş sayfasına dön
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Adresi</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Kayıtlı email adresiniz"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </Button>

                <Link to="/login">
                  <Button variant="ghost" className="w-full gap-2 mt-2">
                    <ArrowLeft className="w-4 h-4" />
                    Giriş sayfasına dön
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
