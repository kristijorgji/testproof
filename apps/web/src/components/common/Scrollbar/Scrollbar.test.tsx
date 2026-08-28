import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Scrollbar } from './Scrollbar';

describe('Scrollbar', () => {
    it('renders a vertical overflow container by default', () => {
        const html = renderToStaticMarkup(createElement(Scrollbar, { className: 'h-40' }, 'content'));
        expect(html).toContain('overflow-y-auto');
        expect(html).toContain('h-40');
        expect(html).toContain('content');
    });

    it('applies horizontal overflow when requested', () => {
        const html = renderToStaticMarkup(createElement(Scrollbar, { orientation: 'horizontal' }, 'wide'));
        expect(html).toContain('overflow-x-auto');
        expect(html).toContain('overflow-y-hidden');
    });
});
