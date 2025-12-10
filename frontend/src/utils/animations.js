// Framer Motion Animation Variants
// Basic Color Fashion Website

export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    }
};

export const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    }
};

export const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// Color swatch hover animation
export const colorSwatchHover = {
    rest: { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
    hover: {
        scale: 1.15,
        boxShadow: '0 4px 15px -3px rgba(0,0,0,0.2)',
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    active: {
        scale: 1.1,
        boxShadow: '0 0 0 2px #111111',
        transition: { duration: 0.15 }
    }
};

// Product card hover
export const productCardHover = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    },
    hover: {
        scale: 1.02,
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// Category slide animation
export const categorySlide = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: (direction) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
    })
};

// Page transition
export const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.3, ease: 'easeIn' }
    }
};

// Navbar scroll animation (use with useScroll)
export const navbarVariants = {
    transparent: {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backdropFilter: 'blur(0px)'
    },
    solid: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)'
    }
};

// Hero content animation
export const heroContent = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            staggerChildren: 0.15
        }
    }
};

export const heroItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    }
};
