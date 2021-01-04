// import { Children, useState, useCallback } from 'react';
// import PropTypes from 'prop-types';
// import { classNames, _ } from '@app/helpers';
// import { useAppContext } from '@app/contextProvider';
// import { mergeIds } from './core/helpers';
// import { Collapsible, Radio } from '@app/components';
// import classes from '@app/components/core/styles.css';
// import { formControl } from './formControl';

// const { isString, get, pick } = _,
//   containerStyle = (layout, flex) =>
//     flex
//       ? { flexDirection: layout }
//       : {
//           gridTemplateColumns: `repeat(${
//             layout.cols || 1
//           }, minmax(0, 1fr))`,
//           gridTemplateRows: `repeat(${layout.rows || 1}, auto)`,
//         },
//   hideItem = (hidden, ctx = {}) =>
//     hidden && (isString(hidden) ? ctx[hidden] : hidden(ctx)),
//   styleItem = (loc) => {
//     if (!loc) return undefined;
//     const { row = 1, col = 1, rowSpan = 1, colSpan = 1 } = loc;
//     return {
//       gridArea: `${row} / ${col} / ${row + rowSpan} / ${
//         col + colSpan
//       }`,
//       justifySelf: 'stretch', // width: '100%',
//     };
//   };
// const containers = ['FormGroup', 'FormSection', 'FormTabs'],
//   getMeta = (schema, { dataid, boundTo, bound }, meta) => {
//     let met = schema?.[bound] || schema?.[boundTo?.valueType] || meta;
//     if (meta?.fields && dataid) {
//       const field = meta.fields.find((f) => f.name === dataid);
//       met = schema[field?.type];
//     }
//     return met;
//   };
// //----------------------------------
// const Form = ({ boundTo = {}, model, onChange, ...rest }) => {
//   const {
//       pageContext: { ctx },
//     } = useAppContext(),
//     name = boundTo.alias || boundTo.name,
//     changed = useCallback((value, path, op = 'edit') => {
//       onChange({
//         op,
//         path,
//         src: name,
//         value,
//       });
//     }, []);

//   return (
//     <FormGroup
//       model={model?.[name]}
//       meta={ctx.schema[boundTo.valueType]}
//       onChange={changed}
//       {...rest}
//     />
//   );
// };
// Form.propTypes = {
//   boundTo: PropTypes.object,
//   model: PropTypes.object,
//   onChange: PropTypes.func,
// };
// //----------------------------------
// const FormGroup = (props) => {
//   const {
//       layout = 'column',
//       model,
//       parentId,
//       dataid,
//       meta,
//       className,
//       children,
//       onChange,
//     } = props,
//     //possible values: column, row -flex, {cols, rows} -grid
//     isFlex = isString(layout),
//     klass = classNames([
//       className,
//       isFlex ? classes.formFlex : classes.formGrid,
//     ]);
//   const { pageContext } = useAppContext(),
//     ctx = pageContext.ctx,
//     met = getMeta(ctx.schema, props, meta),
//     id = mergeIds(parentId, dataid);

//   return (
//     <article className={klass} style={containerStyle(layout, isFlex)}>
//       {Children.map(children, (child) => {
//         const Type = child.type,
//           { loc, hidden, ...rest } = child.props,
//           styled = styleItem(!isFlex && loc);

//         if (!Type) return child;
//         if (hideItem(hidden, ctx.context)) return null;

//         return containers.includes(Type.name) ? (
//           <Type
//             {...rest}
//             parentId={id}
//             meta={met}
//             model={get(model, rest.dataid)} //can be bound
//             onChange={onChange}
//             style={styled}
//           />
//         ) : (
//           formControl(
//             Type,
//             rest,
//             id,
//             model,
//             met,
//             ctx,
//             onChange,
//             styled
//           )
//         );
//       })}
//     </article>
//   );
// };

// FormGroup.propTypes = {
//   parentId: PropTypes.string,
//   dataid: PropTypes.string,
//   className: PropTypes.string,
//   children: PropTypes.any,
//   layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//   meta: PropTypes.object,
//   model: PropTypes.object,
//   onChange: PropTypes.func,
// };

// //----------------------------------
// const FormSection = ({ title, ...rest }) => {
//   //TBD: always start open???
//   return (
//     <Collapsible title={<h4>{title}</h4>} open={true}>
//       {<FormGroup {...rest} />}
//     </Collapsible>
//   );
// };

// FormSection.propTypes = {
//   title: PropTypes.string,
// };

// //----------------------------------
// const tabProps = ['id', 'name'],
//   Tab = (props) => {
//     return <FormGroup {...props} />;
//   },
//   FormTabs = (props) => {
//     const {
//         id,
//         selectedTab,
//         children,
//         className,
//         style,
//         ...rest
//       } = props,
//       tabs = Children.map(children, (e) => pick(e.props, tabProps)),
//       [selected, select] = useState(selectedTab || tabs[0].id),
//       onTab = (tab) => {
//         select(tab);
//         //dispatch(PAGES, {value: {tab:id}})
//       };

//     return (
//       <section className={className} style={style}>
//         <nav role="tabpanel">
//           <Radio
//             id={id}
//             groupOf="tabs"
//             horizontal
//             display="name"
//             options={tabs}
//             style={{ fontSize: '1.1em' }}
//             value={selected}
//             onChange={onTab}
//           />
//         </nav>
//         <div className={classes.containerRelative}>
//           {Children.map(children, (e) => {
//             const id = e.props.id,
//               isSelected = selected === id;
//             return (
//               <FormGroup
//                 {...rest}
//                 {...e.props}
//                 key={id}
//                 id={id}
//                 className={classNames([classes.sPanel], {
//                   [classes.sPanelActive]: isSelected,
//                 })}
//               />
//             );
//           })}
//         </div>
//       </section>
//     );
//   };
// FormTabs.Tab = Tab;
// FormTabs.propTypes = {
//   children: PropTypes.any,
//   id: PropTypes.any,
//   selectedTab: PropTypes.string,
//   className: PropTypes.string,
//   style: PropTypes.object,
// };

// export { Form, FormGroup, FormSection, FormTabs };
