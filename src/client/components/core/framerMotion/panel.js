import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { useToggle } from '@app/utils/hooks';

Panel.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  open: PropTypes.bool,
};
export default function Panel({ title, text, open }) {
  const [isOpen, toggle] = useToggle(open);
  return (
    <section className="panel flex-column flex-stretch">
      <button onClick={toggle}>
        <i
          className={classNames(['clip-icon caret-down lg'], {
            ['rotate-90']: isOpen,
          })}></i>
        <h6>{title}</h6>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{
              duration: 0.3,
              // ease: [0.04, 0.62, 0.23, 0.98],
            }}>
            <p className="mt-2 mb-2 ml-4">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
