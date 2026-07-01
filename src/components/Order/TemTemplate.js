/**
 * TemTemplate.js — Template Router
 *
 * This file acts as a router that reads the user's selected template ID
 * from AsyncStorage and renders the corresponding template component.
 *
 * The export name (PrintTemplate) is kept identical to the original
 * so that RootNavigation.js and other consumers don't need any import changes.
 */
import React, { useEffect, useState } from 'react';
import AsyncStorage from 'store/async_storage/index';
import { getTemplateById, DEFAULT_TEMPLATE_ID } from './TemTemplateRegistry';

const PrintTemplate = ({ orderPrint, settings = {}, onLayout }) => {
    const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);

    useEffect(() => {
        const loadTemplateId = async () => {
            try {
                const printerInfo = await AsyncStorage.getLabelPrinterInfo();
                const id = printerInfo?.labelTemplateId || DEFAULT_TEMPLATE_ID;
                setTemplateId(id);
            } catch (error) {
                console.error('TemTemplate Router: Error loading template ID:', error);
            }
        };
        loadTemplateId();
    }, [orderPrint]);

    const templateInfo = getTemplateById(templateId);
    const TemplateComponent = templateInfo.component;

    console.log(`\n║ PRINT_TEM: TemTemplate Router → using "${templateInfo.id}" (${templateInfo.name})`);

    return <TemplateComponent orderPrint={orderPrint} settings={settings} onLayout={onLayout} />;
};

export default PrintTemplate;
