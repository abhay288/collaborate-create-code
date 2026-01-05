import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import AvsarLogo from "@/components/AvsarLogo";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <AvsarLogo size="sm" showText={false} className="opacity-80 hover:opacity-100 transition-opacity" />
              <div>
                <span className="font-heading font-bold text-lg text-foreground">AVSAR</span>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">Career Atlas</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered career and education guidance for Indian students. Find your path with confidence.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/careers", label: "Careers" },
                { to: "/colleges", label: "Colleges" },
                { to: "/scholarships", label: "Scholarships" },
                { to: "/ngos", label: "NGO Network" },
                { to: "/quiz", label: "Aptitude Quiz" },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/about", label: "About Us" },
                { to: "/features", label: "Features" },
                { to: "/contact", label: "Contact" },
                { to: "/help", label: "Help Center" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms of Service" },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors break-all">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{CONTACT_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AVSAR. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;