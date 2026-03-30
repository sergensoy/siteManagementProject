import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/services/mockApi';
import type { UpdateProfilePayload } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Mail, Phone, Building2, Briefcase, Save, Lock, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
  });

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await mockApi.updateUser(user.id, form);
      updateCurrentUser(updated);
      setEditing(false);
      toast({ title: 'Başarılı', description: 'Profil güncellendi' });
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const infoItems = [
    { icon: UserIcon, label: 'Kullanıcı Adı', value: user.username },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Telefon', value: user.phone || '—' },
    { icon: Building2, label: 'Departman', value: user.department || '—' },
    { icon: Briefcase, label: 'Pozisyon', value: user.position || '—' },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profilim</h1>
          <p className="text-muted-foreground">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{user.fullName}</h2>
              <p className="text-muted-foreground">{user.position || user.department || user.email}</p>
            </div>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
            </Badge>
          </CardContent>
        </Card>

        {/* Info / Edit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Kişisel Bilgiler</CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Düzenle
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Departman</Label>
                  <Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Pozisyon</Label>
                  <Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    İptal
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {infoItems.map(item => (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground w-32">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Password Change */}
        <PasswordChangeCard userId={user.id} />
      </div>
    </AppLayout>
  );
};

const PasswordChangeCard = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Hata', description: 'Yeni şifreler eşleşmiyor', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await mockApi.changePassword(userId, currentPassword, newPassword);
      toast({ title: 'Başarılı', description: 'Şifreniz değiştirildi' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Şifre Değiştir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mevcut Şifre</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Yeni Şifre</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="En az 6 karakter"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Yeni Şifre (Tekrar)</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Profile;
