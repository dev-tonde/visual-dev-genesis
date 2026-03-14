import { motion, type Variants } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '@/config/profile';

interface ContactInfoProps {
  variants: Variants;
}

const ContactInfo = ({ variants }: ContactInfoProps) => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: PROFILE.email,
      link: PROFILE.emailHref,
      external: false,
    },
    {
      icon: Phone,
      title: 'Phone',
      value: PROFILE.phoneDisplay,
      link: PROFILE.phoneHref,
      external: false,
    },
    {
      icon: MapPin,
      title: 'Location',
      value: PROFILE.locationDisplay,
      link: PROFILE.locationHref,
      external: true,
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      name: 'GitHub',
      url: PROFILE.githubUrl,
      color: 'hover:text-gray-300',
      external: true,
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      url: PROFILE.linkedinUrl,
      color: 'hover:text-blue-400',
      external: true,
    },
    {
      icon: Mail,
      name: 'Email',
      url: PROFILE.emailHref,
      color: 'hover:text-red-400',
      external: false,
    }
  ];

  return (
    <motion.div variants={variants} className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-primary">Get in Touch</h3>
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <motion.a
              key={info.title}
              href={info.link}
              target={info.external ? '_blank' : undefined}
              rel={info.external ? 'noopener noreferrer' : undefined}
              className="flex items-center space-x-4 p-4 glass rounded-lg hover:bg-primary/10 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              whileHover={{ x: 5 }}
              aria-label={`Contact via ${info.title}: ${info.value}`}
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <info.icon className="w-5 h-5 icon-primary" />
              </div>
              <div>
                <p className="font-medium">{info.title}</p>
                <p className="text-muted-foreground">{info.value}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-6 text-primary">Profiles</h3>
        <div className="flex space-x-4">
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target={social.external ? '_blank' : undefined}
              rel={social.external ? 'noopener noreferrer' : undefined}
              className={`interactive-icon-button glass h-14 w-14 rounded-lg ${social.color} group`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Visit my ${social.name} profile`}
            >
              <social.icon className="w-6 h-6 icon-primary" />
            </motion.a>
          ))}
        </div>
      </div>

      <motion.div
        className="p-6 glass rounded-lg"
        variants={variants}
      >
        <h4 className="text-lg font-semibold mb-3">Quick Response</h4>
        <p className="text-muted-foreground">
          Typical reply time is within one business day. If the brief is time-sensitive, email or LinkedIn is the fastest route.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ContactInfo;
