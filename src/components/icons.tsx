
import {
  PlusCircle,
  LayoutGrid,
  Settings,
  FileText,
  Edit3,
  Trash2,
  Download,
  Copy,
  RefreshCw,
  ChevronDown,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  Sparkles, // Used for Icons.Improve
  Wand2, // Alternative for Improve, currently Icons.Simplify
  Palette, // For style/tone
  Type, // For length or text options
  Search, // For SEO/gap analysis, currently Icons.SEO
  ShieldCheck, // For plagiarism check
  BarChart3, // For SEO scores, will also be Icons.Analytics
  ImageIcon,
  Share2,
  MessageSquare, // For tweet
  Linkedin, // For LinkedIn
  Mail, // For Email
  Instagram as LucideInstagram, // For Instagram
  UserCircle,
  Grid,
  List,
  ExternalLink,
  MoreVertical,
  Loader2,
  Image as LucideImage,
  Save,
  Check,
  HelpCircle,
  KeyRound,
  LogIn,
  LogOut,
  UserPlus,
  Star, // For Favorite
  Lightbulb, // For Product Tour
  Users, // For Team/Collaboration
  ThumbsUp,
  ThumbsDown,
  type LucideProps,
} from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
  ),
  NewBlog: PlusCircle,
  Dashboard: LayoutGrid,
  Settings: Settings,
  MyBlogs: FileText,
  Edit: Edit3,
  Delete: Trash2,
  Export: Download,
  Copy: Copy,
  Regenerate: RefreshCw,
  ChevronDown: ChevronDown,
  Sun: Sun,
  Moon: Moon,
  ChevronLeft: ChevronLeft,
  ChevronRight: ChevronRight,
  FilePlus: FilePlus,
  Improve: Sparkles,
  Expand: ExternalLink,
  Simplify: Wand2,
  Style: Palette,
  Length: Type,
  SEO: Search,
  Plagiarism: ShieldCheck,
  Scores: BarChart3,
  Analytics: BarChart3, // Reusing Scores icon for Analytics
  PlaceholderImage: ImageIcon,
  Share: Share2,
  Tweet: MessageSquare,
  LinkedIn: Linkedin,
  Email: Mail,
  Instagram: LucideInstagram,
  User: UserCircle,
  Grid: Grid,
  List: List,
  MoreVertical: MoreVertical,
  Spinner: Loader2,
  Image: LucideImage,
  Save: Save,
  Check: Check,
  HelpCircle: HelpCircle,
  ProductTour: Lightbulb, // Icon for Product Tour
  KeyRound: KeyRound,
  LogIn: LogIn,
  LogOut: LogOut,
  UserPlus: UserPlus,
  Favorite: Star, // Icon for Favorite
  Team: Users, // Icon for Team/Collaboration
  ThumbsUp: ThumbsUp,
  ThumbsDown: ThumbsDown,
};

export type IconName = keyof typeof Icons;
