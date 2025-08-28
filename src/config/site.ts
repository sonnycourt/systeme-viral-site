export const siteConfig = {
	name: 'Système Viral',
	description: 'Formation complète en marketing digital et stratégies de croissance pour entrepreneurs ambitieux',
	url: 'https://systemeviral.com',
	ogImage: '/og-image.jpg',
	links: {
		linkedin: 'https://linkedin.com/company/systemeviral',
		youtube: 'https://youtube.com/@systemeviral',
	},
	contact: {
		email: 'contact@systemeviral.com',
		phone: '+33 1 23 45 67 89',
	},
	nav: [
		{ title: 'Accueil', href: '/' },
		{ title: 'Formation', href: '/formation' },
		{ title: 'Programme', href: '/programme' },
		{ title: 'Témoignages', href: '/temoignages' },
		{ title: 'Contact', href: '/contact' },
	],
} as const;
