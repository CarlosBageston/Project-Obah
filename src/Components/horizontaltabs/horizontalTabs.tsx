import React from 'react';
import clsx from 'clsx';
import {
    Container,
    HorizontalTabsContainer,
    TabButton,
    TabLabel,
    TabContent,
    TitleContainer,
} from './style';

/**
 * Modelo de tab para o componente HorizontalTabs
 *
 * @author Carlos Bageston <carlos.bageston@kepha.com.br>
 * @interface HorizontalTabsTab
 */
export type HorizontalTabsTab = {
    label: string | JSX.Element;
    content: any;
    disabled?: boolean;
    tabTitle?: string;
    tabOptions?: React.ReactNode[];
};

export type HorizontalTabsProps = {
    tabs: HorizontalTabsTab[];
    onChangeIndex?: (index: number) => void;
    selectedIndex?: number;
    title?: string;
};

/**
 * Componente de Tabs na Horizontal customizado
 *
 * @author Carlos Bageston <carlos.bageston@kepha.com.br>
 * @param {HorizontalTabsProps} props
 */

function HorizontalTabs(props: HorizontalTabsProps): JSX.Element {
    const { onChangeIndex, tabs, selectedIndex = 0, title } = props;

    return (
        <Container>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {title && (
                    <TitleContainer>
                        {tabs[selectedIndex].tabTitle ?? title}
                    </TitleContainer>
                )}
            </div>
            <HorizontalTabsContainer>
                {tabs.map((tab, index) => (
                    <TabButton
                        key={index}
                        className={clsx(
                            index === selectedIndex && 'selected',
                            tab.disabled && 'disabled'
                        )}
                        onClick={() => {
                            if (!tab.disabled && onChangeIndex) {
                                onChangeIndex(index);
                            }
                        }}
                    >
                        <TabLabel>{tab.label}</TabLabel>
                    </TabButton>
                ))}
            </HorizontalTabsContainer>
            <TabContent>{tabs[selectedIndex].content}</TabContent>
        </Container>
    );
}

export default HorizontalTabs;