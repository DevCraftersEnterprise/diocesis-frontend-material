import { Injectable } from '@angular/core';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Building,
  Calendar,
  Calendar1,
  Church,
  CircleUserRound,
  Copy,
  Download,
  Earth,
  File,
  FileImage,
  FilePlusCorner,
  Folder,
  Gavel,
  Globe,
  GraduationCap,
  HandCoins,
  Heart,
  HeartHandshake,
  History,
  House,
  IdCard,
  Image,
  ImagePlay,
  Landmark,
  Library,
  LogOut,
  Map,
  MapPin,
  MapPinHouse,
  Megaphone,
  Menu,
  Network,
  Newspaper,
  Pen,
  Plus,
  Search,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  SquareUser,
  Trash,
  TvMinimalPlay,
  Upload,
  User,
  UserPlus,
  Users,
} from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  readonly logout = LogOut;
  readonly menu = Menu;
  readonly users = Users;
  readonly download = Download;
  readonly addUser = UserPlus;
  readonly search = Search;
  readonly active = ShieldCheck;
  readonly inactive = ShieldX;
  readonly next = ArrowRight;
  readonly previous = ArrowLeft;
  readonly edit = Pen;
  readonly disable = ShieldOff;
  readonly upload = Upload;
  readonly carousel = ImagePlay;
  readonly delete = Trash;
  readonly reverends = Church;
  readonly avatarPlaceholder = CircleUserRound;
  readonly newspaper = Newspaper;
  readonly addInformation = FilePlusCorner;
  readonly picture = Image;
  readonly map = Map;
  readonly network = Network;
  readonly add = Plus;
  readonly parish = MapPinHouse;
  readonly parishPlaceholder = Building;
  readonly articles = BookOpenText;
  readonly documents = File;
  readonly documentPlaceholder = FileImage;
  readonly copy = Copy;

  // Navigation icons
  readonly home = House;
  readonly history = History;
  readonly user = User;
  readonly calendar = Calendar;
  readonly calendar1 = Calendar1;
  readonly heart = Heart;
  readonly hammer = Gavel;
  readonly bank = Landmark;
  readonly phoneAgenda = SquareUser;
  readonly megaphone = Megaphone;
  readonly graduationCap = GraduationCap;
  readonly national = Earth;
  readonly international = Globe;
  readonly archive = Folder;
  readonly idCard = IdCard;
  readonly tv = TvMinimalPlay;
  readonly handCoins = HandCoins;
  readonly mapPin = MapPin;
  readonly building = Building;
  readonly church = Church;
  readonly institute = Library;
  readonly isma = HeartHandshake;
}
