export const PROFILE = {
  fullName: 'Tonderai Matanga',
  firstName: 'Tonderai',
  email: 'hello@iamtonde.co.za',
  emailHref: 'mailto:hello@iamtonde.co.za',
  phoneDisplay: '+27 (0)81 432 1220',
  phoneHref: 'tel:+27814321220',
  locationDisplay: 'Johannesburg and Cape Town, South Africa',
  locationHref: 'https://maps.google.com/?q=Johannesburg,South+Africa',
  githubUrl: 'https://github.com/dev-tonde',
  portfolioRepoUrl: 'https://github.com/dev-tonde/visual-dev-genesis',
  linkedinUrl: 'https://www.linkedin.com/in/tonderai-matanga/',
  cvHref: '/Tonderai_Matanga_CV.pdf',
  cvFileName: 'Tonderai_Matanga_CV.pdf',
} as const;

export const PROFILE_SAME_AS_URLS = [
  PROFILE.githubUrl,
  PROFILE.linkedinUrl,
] as const;

export const downloadCv = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('a');
  link.href = PROFILE.cvHref;
  link.download = PROFILE.cvFileName;
  link.click();
};
