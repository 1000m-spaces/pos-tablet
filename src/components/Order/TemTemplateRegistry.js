/**
 * TemTemplateRegistry.js — Central registry for all label templates
 *
 * To add a new template:
 * 1. Create templates/TemTemplateN.js implementing the same props interface
 * 2. Add an entry to TEMPLATE_REGISTRY below
 * That's it! The router (TemTemplate.js) and settings UI will pick it up automatically.
 */
import TemTemplate1 from './templates/TemTemplate1';
import TemTemplate2 from './templates/TemTemplate2';

// ─────── Template Registry ───────
const TEMPLATE_REGISTRY = {
    template1: {
        id: 'template1',
        name: 'Cổ điển (Đen-Trắng)',
        description: 'Header đen, body trắng, barcode ở footer',
        component: TemTemplate1,
    },
    template2: {
        id: 'template2',
        name: 'Trắng sạch + QR Code',
        description: 'Nền trắng toàn bộ, QR code ở footer, không barcode',
        component: TemTemplate2,
    },
    // ─── Future templates ───
    // template3: {
    //     id: 'template3',
    //     name: 'Tối giản',
    //     description: 'Layout tối giản, chỉ hiện thông tin cần thiết',
    //     component: TemTemplate3,
    // },
};

// ─────── Default template ID ───────
export const DEFAULT_TEMPLATE_ID = 'template1';

// ─────── Registry API ───────

/**
 * Get list of all available templates (for Settings UI dropdown)
 * @returns {Array<{id: string, name: string, description: string}>}
 */
export const getTemplateList = () => Object.values(TEMPLATE_REGISTRY).map(({ id, name, description }) => ({
    id, name, description,
}));

/**
 * Get template entry by ID. Falls back to default if not found.
 * @param {string} templateId
 * @returns {{ id: string, name: string, description: string, component: React.Component }}
 */
export const getTemplateById = (templateId) => {
    return TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
};

export default TEMPLATE_REGISTRY;
