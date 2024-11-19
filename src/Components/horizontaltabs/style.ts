import { styled } from '@mui/material/styles';

// Definindo os componentes estilizados usando `styled`
export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const HorizontalTabsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  borderBottom: `2px solid ${theme.palette.grey[100]}`,
  paddingLeft: '2rem',
  paddingRight: '2rem',
}));

export const TabButton = styled('div')(({ theme }) => ({
  backgroundColor: 'transparent',
  height: '100%',
  fontWeight: 400,
  display: 'flex',
  alignItems: 'center',
  paddingRight: 15,
  paddingLeft: 15,
  justifyContent: 'space-between',
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  cursor: 'pointer',
  borderBottom: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
  },
  '&.selected': {
    backgroundColor: 'transparent !important',
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    fontWeight: 500,
  },
  '&.disabled': {
    backgroundColor: 'transparent !important',
    color: theme.palette.text.disabled,
    cursor: 'default !important',
  },
}));

export const TabLabel = styled('div')({
  flex: 1,
  padding: '10px 20px',
});

export const TabContent = styled('div')({
  flex: 1,
  overflowY: 'auto',
});

export const TitleContainer = styled('div')({
  maxHeight: 44,
  padding: '0 0 4rem 2rem',
  fontSize: 28,
  color: '#000000',
  fontWeight: '500',
  maxWidth: '100%',
});