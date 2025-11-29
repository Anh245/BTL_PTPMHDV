import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Train,
  MapPin,
  Clock,
  Users,
  Settings,
  Bell,
  Shield,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function Profile() {
  const userProfile = {
    name: "Sarah Johnson",
    role: "Quản lý Ga",
    email: "sarah.johnson@trainstation.com",
    phone: "+1 (555) 123-4567",
    joinDate: "Tháng 1 năm 2022",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  };

  const assignedStations = [
    { name: "Nhà ga Trung tâm", location: "Trung tâm thành phố", status: "active", trains: 45 },
    { name: "Nhà ga Bắc", location: "Quận Bắc", status: "active", trains: 32 },
    { name: "Giao lộ Đông", location: "Khu phố Đông", status: "maintenance", trains: 18 },
  ];

  const recentActivity = [
    { action: "Cập nhật lịch trình", station: "Nhà ga Trung tâm", time: "2 giờ trước", type: "success" },
    { action: "Cảnh báo bảo trì", station: "Giao lộ Đông", time: "5 giờ trước", type: "warning" },
    { action: "Họp nhân viên", station: "Nhà ga Bắc", time: "1 ngày trước", type: "info" },
    { action: "Kiểm tra an toàn", station: "Nhà ga Trung tâm", time: "2 ngày trước", type: "success" },
  ];

  const stats = [
    { label: "Tổng số ga", value: "3", icon: MapPin },
    { label: "Tàu hoạt động", value: "95", icon: Train },
    { label: "Nhân viên", value: "127", icon: Users },
    { label: "Đúng giờ TB", value: "94%", icon: Clock },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Hồ sơ</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Quản lý cài đặt tài khoản và tùy chọn của bạn
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Cài đặt
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{userProfile.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">{userProfile.role}</p>
                  <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{userProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Tham gia {userProfile.joinDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>Chỉnh sửa hồ sơ</Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stations">Ga được giao</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
          <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ga của bạn</CardTitle>
              <CardDescription>
                Các ga dưới sự quản lý của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedStations.map((station, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                          <MapPin className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-slate-100 font-medium mb-1">{station.name}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{station.location}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={station.status === "active" ? "default" : "secondary"}>
                              {station.status === "active" ? "Hoạt động" : "Bảo trì"}
                            </Badge>
                            <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                              <Train className="w-3 h-3" />
                              {station.trains} tàu/ngày
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Xem chi tiết</Button>
                    </div>
                    {index < assignedStations.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các hành động và cập nhật gần đây của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        activity.type === "success" ? "bg-green-100 dark:bg-green-900/50" :
                        activity.type === "warning" ? "bg-orange-100 dark:bg-orange-900/50" :
                        "bg-blue-100 dark:bg-blue-900/50"
                      }`}>
                        {activity.type === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : activity.type === "warning" ? (
                          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{activity.action}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">{activity.station}</span>
                          <span className="text-slate-400 text-sm">•</span>
                          <span className="text-slate-500 dark:text-slate-500 text-sm">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn thông báo</CardTitle>
              <CardDescription>
                Quản lý cách bạn nhận cập nhật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo Email</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nhận cập nhật qua email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cảnh báo bảo trì</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nhận thông báo về bảo trì ga</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thay đổi lịch trình</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật về thay đổi lịch trình tàu</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Báo cáo an toàn</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Thông báo sự cố an toàn quan trọng</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bảo mật</CardTitle>
              <CardDescription>
                Quản lý bảo mật tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Xác thực hai yếu tố</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Thêm lớp bảo mật bổ sung</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>Mật khẩu</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Đã thay đổi 3 tháng trước</p>
                </div>
                <Button variant="outline" size="sm">Đổi mật khẩu</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Cấp độ truy cập
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý Ga - Toàn quyền truy cập</p>
                </div>
                <Badge>Đã xác minh</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
