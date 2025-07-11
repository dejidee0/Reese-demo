import { motion } from 'framer-motion'
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function Footer() {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'New Arrivals', href: '/new' },
        { name: 'Best Sellers', href: '/bestsellers' },
        { name: 'Sale', href: '/sale' },
        { name: 'Gift Cards', href: '/gift-cards' },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Style Arena', href: '/arena' },
        { name: 'Your Closet', href: '/closet' },
        { name: 'VIP Access', href: '/vip-access' },
        { name: 'Referrals', href: '/referrals' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'Shipping', href: '/shipping' },
        { name: 'Returns', href: '/returns' },
        { name: 'Contact', href: '/contact' },
      ]
    }
  ]

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="border-b border-gray-800 pb-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay in the Loop</h3>
            <p className="text-gray-400 mb-6">
              Get early access to drops, exclusive content, and style tips
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-900 border-gray-800 text-white placeholder-gray-400"
              />
              <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent mb-4"
            >
              ReeseBlanks
            </motion.div>
            <p className="text-gray-400 text-sm mb-4">
              The luxe vanguard of streetwear culture. Defining tomorrow's style today.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 ReeseBlanks. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}