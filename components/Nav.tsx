"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedCustomDie from "./Die/AnimatedCustomDie";
import Tag from "./Tag";
import CoinCounter from "./CoinCounter";

const STARTING_DIE_IDENTIFIER = {
  left: 2,
  top: 5,
  right: 3,
};

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

function NavItem({ href, children }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className="block py-2 px-3 text-white font-bold text-lg rounded md:bg-transparent transition-all md:p-0 hover:text-secondary-200"
      >
        [{children}]
      </Link>
    </li>
  );
}

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed w-full z-navbar shadow-[0px_4px_8px_0px_#8b1d6d]">
      <nav className="bg-dark-500">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <AnimatedCustomDie startingDieIdentifier={STARTING_DIE_IDENTIFIER} />
            <Link href="/">
              <span className="nav-logo self-center text-2xl font-semibold whitespace-nowrap text-white">
                ME<Tag text="TAG" speed={0.005} catchDistance={50} />AME 2025
              </span>
            </Link>
          </div>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden focus:outline-none focus:ring-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
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
          
          <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full lg:block lg:w-auto`} id="navbar-default">
            <ul className="font-medium flex flex-col items-end p-2 lg:p-0 mt-4 lg:flex-row lg:gap-x-5 rtl:space-x-reverse lg:mt-0">
              <CoinCounter />
              <NavItem href="/#speakers">Speakers</NavItem>
              <NavItem href="/#tickets">Tickets</NavItem>
              <NavItem href="/contribute">Get Involved</NavItem>
              <NavItem href="/#sponsors">Sponsors</NavItem>
              <NavItem href="/faq">FAQ</NavItem>
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
          text-shadow: 0 0 5px #ff57ff, 0 0 15px #aa33ff;
        }

        :global(.light) .nav-logo {
          color: #ff57ff;
          text-shadow: 0 0 2px rgba(255, 87, 255, 0.3);
        }

        :global(.light) .nav-logo:hover {
          text-shadow: 0 0 5px rgba(255, 87, 255, 0.7), 0 0 10px rgba(170, 51, 255, 0.5);
        }
      `}</style>
    </div>
  );
} 