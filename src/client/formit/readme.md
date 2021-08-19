Form must have an id, either passed directly or defined in form config object
Form includes containers: Section, Panel, TabPanel, Conditional, Group, Inline, or another Form (sub-form) and Field, no html tags or custom components can be used directly.
Section is a basic container, all others will wrap certian html and nest Section, TabPanel will nest a Section for each Tab.

Inline:
As using custom or standard components is not allowed, you could use Inline as a thin wrapper over custom component, passing component via function and spreading parent props, as follows:
<Inline>{(props) => <Task {...props} id="task" />}</Inline>
Inline - in markup - has no props but some will be apssed by its parent, so always use this functional form.

Conditional:
To choose dynamically which component to display based on the model.
prop condition is used to define which child to display (by index), if -1 or undefined, then default value is displayed as <h6>{placeholder}</h6>, other props are propagated down (no need to define prop loc on both children, use it on parent), use as follows
<Conditional
loc={{ col: 2 }}
condition={(m) => (m ? (m.items ? 1 : 0) : -1)}
calcid="selectedTask"
placeholder="Select task ...">
<Panel/>
<Panel/>
</Conditional>
Conditional may be used to output custom componentr directly, no need to wrap in Inline, e.g
<Conditional><Task/><Group/></Conditional>
