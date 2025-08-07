import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

interface ContactInfoProps {
  variants: any;
}

const ContactInfo = ({ variants }: ContactInfoProps) => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@iamtonde.co.za',
      link: 'mailto:hello@iamtonde.co.za'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+27 (0)81 432 1220',
      link: 'tel:+27814321220'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Johannesburg and Cape Town, South Africa',
      link: 'https://maps.google.com/?q=Johannesburg,South+Africa'
    }
  ];

  const socialLinks = [
    {
      icon: Github,
      name: 'GitHub',
      url: 'https://github.com/dev-tonde',
      color: 'hover:text-gray-300'
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/tonderai-matanga/',
      color: 'hover:text-blue-400'
    },
    {
      icon: Mail,
      name: 'Email',
      url: 'mailto:hello@iamtonde.co.za',
      color: 'hover:text-red-400'
    }
  ];

  return (
    <motion.div variants={variants} className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-primary">Get in Touch</h3>
        <div className="space-y-4">
          {contactInfo.map((info, index) => (
            <motion.a
              key={info.title}
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
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
        <h3 className="text-2xl font-semibold mb-6 text-primary">Follow Me</h3>
        <div className="flex space-x-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 glass rounded-lg ${social.color} transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
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
          I typically respond to emails within 24 hours. For urgent matters, 
          feel free to reach out via phone or LinkedIn.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ContactInfo;