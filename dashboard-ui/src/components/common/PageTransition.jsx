import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        x: 20,
        scale: 0.98
    }
};

const pageTransition = {
    type: "spring",
    duration: 0.4,
    damping: 20,
    stiffness: 100,
    mass: 0.8
};

function PageTransition({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition; 