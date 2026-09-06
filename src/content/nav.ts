export interface NavLink {
  label: string;
  href: string;
  n: string;
}

export const navLinks: NavLink[] = [
  { label: "About", href: "#about", n: "01" },
  { label: "Work", href: "#work", n: "02" },
  { label: "Skills", href: "#skills", n: "03" },
  { label: "Journey", href: "#journey", n: "04" },
  { label: "Contact", href: "#contact", n: "05" },
];
