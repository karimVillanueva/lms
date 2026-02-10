import { apply, setAttr } from '@directus/visual-editing';

let started = false;

export function initVisualEditor() {
    if (typeof window === 'undefined' || started) return;

    started = true;

    apply({
        directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
        onSaved: () => window.location.reload(),
    });
}

export { setAttr };
