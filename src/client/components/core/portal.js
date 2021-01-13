// import { useEffect, useRef } from 'react';
// import { createPortal } from 'react-dom';

// // const Portal = ({ children }) => {
// //   const mount = document.getElementById('portal-root');
// //   const el = document.createElement('div');

// //   useEffect(() => {
// //     mount.appendChild(el);
// //     return () => mount.removeChild(el);
// //   }, [el, mount]);

// //   return createPortal(children, el);
// // };

// const Portal = ({ type = 'app', id, className, children }) => {
//   const el = useRef(document.createElement('div'));

//   useEffect(() => {
//     const mount = document.getElementById(`${type}-portal`);
//     el.current.id = id;
//     el.current.classList.add(className);
//     mount.appendChild(el.current);

//     return () => {
//       mount.removeChild(el.current);
//       el.current = undefined;
//     };
//   }, []);

//   return createPortal(children, el.current);
// };
// export default Portal;
