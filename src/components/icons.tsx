
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
  Sparkles,
  Wand2, // Alternative for Improve
  Palette, // For style/tone
  Type, // For length or text options
  Search, // For SEO/gap analysis
  ShieldCheck, // For plagiarism check
  BarChart3, // For SEO scores
  ImageIcon,
  Share2,
  MessageSquare, // For tweet
  Linkedin, // For LinkedIn
  Mail, // For Email
  UserCircle,
  Grid,
  List,
  ExternalLink,
  MoreVertical,
  Loader2,
  Image as LucideImage,
  Save,
  type LucideProps,
} from 'lucide-react';

export const Icons = {
  Logo: (props: LucideProps) => ( // Simple abstract logo
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
  PlaceholderImage: ImageIcon,
  Share: Share2,
  Tweet: MessageSquare,
  LinkedIn: Linkedin,
  Email: Mail,
  User: UserCircle,
  Grid: Grid,
  List: List,
  MoreVertical: MoreVertical,
  Spinner: Loader2,
  Image: LucideImage,
  Save: Save,
};

export type IconName = keyof typeof Icons;
