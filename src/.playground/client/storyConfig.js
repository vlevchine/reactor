import { pick } from '@app/helpers';
import StoryGroup from './storyGroup';
import components from './_components/index';
import formsConfig from './_forms/_config';
import { schema, model } from './_forms/sampleData';

const processSection = (root, content) => {
  content.forEach((sect) => {
    let section = root.addGroup(sect.name);
    (sect.groups || []).forEach((gr) => {
      const group = section.addGroup(gr.name, { model });
      (gr.stories || []).forEach((st) =>
        group.addFormStory(
          st.name,
          st.id,
          pick(st, [
            'form',
            'queryTypes',
            'query',
            'type',
            'pageData',
          ])
        )
      );
    });
  });
};

const root = 'root',
  componentsRoot = new StoryGroup('components', '1', root),
  formsRoot = new StoryGroup('forms', '2', root, formsConfig);

components(componentsRoot);
processSection(formsRoot, formsConfig);

export { componentsRoot, formsRoot };
