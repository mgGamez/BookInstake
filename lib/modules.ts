import { BarChart3, Bot, FileSearch, Mail, Network, Users, type LucideIcon } from "lucide-react";

export type ModuleDefinition = { href: string; name: string; description: string; icon: LucideIcon };

export const productModules: ModuleDefinition[] = [
  { href: "/document-processing", name: "Document Processing", description: "Extract and organize business documents.", icon: FileSearch },
  { href: "/workflow-generator", name: "Workflow Generator", description: "Turn requirements into workflow drafts.", icon: Bot },
  { href: "/workflow-builder", name: "Workflow Builder", description: "Design and manage automation flows.", icon: Network },
  { href: "/email-assistant", name: "Email Assistant", description: "Draft and manage business communication.", icon: Mail },
  { href: "/business-intelligence", name: "Business Intelligence", description: "Measure operational performance.", icon: BarChart3 },
  { href: "/team-management", name: "Team Management", description: "Manage your team and workspace access.", icon: Users }
];
