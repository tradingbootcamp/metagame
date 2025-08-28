'use client'

import { useState } from 'react'

import AccountButton from './AccountButton'
import CoinCounter from './CoinCounter'
import AnimatedCustomDie from './Die/AnimatedCustomDie'
import Tag from './Tag'
import Link from 'next/link'

const STARTING_DIE_IDENTIFIER = {
  left: 2,
  top: 5,
  right: 3,
}

interface NavItemProps {
  href: string
  children: React.ReactNode
  closeMenu: () => void
}

export function NavItem({ href, children, closeMenu }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={closeMenu}
        className="block rounded px-3 py-2 text-lg font-bold transition-all hover:text-secondary-200 md:bg-transparent md:p-0"
      >
        [{children}]
      </Link>
    </li>
  )
}

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)
  return (
    <div className="fixed z-navbar w-full shadow-[0px_4px_8px_0px_#8b1d6d]">
      <nav className="bg-bg-primary">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AnimatedCustomDie
              startingDieIdentifier={STARTING_DIE_IDENTIFIER}
            />
            <Link href="/">
              <span className="nav-logo self-center text-2xl font-semibold whitespace-nowrap">
                ME
                <Tag text="TAG" speed={0.005} catchDistance={50} />
                AME 2025
              </span>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 focus:ring-2 focus:outline-none lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          <div
            className={`${isMenuOpen ? 'block' : 'hidden'} w-full lg:block lg:w-auto`}
            id="navbar-default"
          >
            <ul className="mt-4 flex flex-col items-center p-2 font-medium lg:mt-0 lg:flex-row lg:gap-x-5 lg:p-0 rtl:space-x-reverse">
              <CoinCounter />
              {/* <NavItem href="/schedule">Schedule</NavItem> */}
              <NavItem href="/#speakers" closeMenu={closeMenu}>
                Speakers
              </NavItem>
              <NavItem href="/#tickets" closeMenu={closeMenu}>
                Tickets
              </NavItem>
              <NavItem href="/contribute" closeMenu={closeMenu}>
                Get Involved
              </NavItem>
              <NavItem href="/schedule" closeMenu={closeMenu}>
                Schedule
              </NavItem>
              <NavItem href="/#sponsors" closeMenu={closeMenu}>
                Sponsors
              </NavItem>
              <NavItem href="/faq" closeMenu={closeMenu}>
                FAQ
              </NavItem>

              <AccountButton closeMenu={closeMenu} />
            </ul>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .nav-logo {
          color: white;
          text-shadow: none;
          position: relative;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .nav-logo:hover {
          text-shadow:
            0 0 5px #ff57ff,
            0 0 15px #aa33ff;
        }

        :global(.light) .nav-logo {
          color: #ff57ff;
          text-shadow: 0 0 2px rgba(255, 87, 255, 0.3);
        }

        :global(.light) .nav-logo:hover {
          text-shadow:
            0 0 5px rgba(255, 87, 255, 0.7),
            0 0 10px rgba(170, 51, 255, 0.5);
        }
      `}</style>
    </div>
  )
}
