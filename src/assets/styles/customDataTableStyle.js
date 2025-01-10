const customDataTableStyle = {
  rows: {
    style: {
      minHeight: 'auto', // override the row height
      fontSize: '12px',
      color: '#3F4254',
      paddingLeft: '0px',
      '&:not(:last-of-type)': {
        borderBottomWidth: '1px',
        borderBottomColor: '#ebedf3',
        borderBottomStyle: 'dashed',
      },
      // '&:last-of-type': {
      //   borderBottom: '1px solid #ebedf3',
      // },
    },
    highlightOnHoverStyle: {
      backgroundColor: '#F3F6F9 ',
    },
  },
  headRow: {
    style: {
      borderBottomColor: '#ebedf3',
      borderBottomStyle: 'dashed',
      backgroundColor: '#ebedf3',
    },
  },
  cells: {
    style: {
      // paddingLeft: "0px", // override the cell padding for data cells
      // paddingRight: "1rem",
      // marginLeft: 'px',
      padding: '0.2rem',
      '&:first-of-type': {
        // borderLeft: '1px solid #ebedf3',
      },
      // borderRight: '1px solid #ebedf3',
    },
  },
  headCells: {
    style: {
      fontSize: '0.9rem',
      fontWeight: 600,
      paddingLeft: '0px',
      paddingRight: '0px',
      color: '#3F4254',
      textTransform: 'uppercase',
      // letterSpacing: '0.1rem',
      // lineHeight: '1.5 !important',
      padding: '0 0.2rem',
      // borderRight: '1px solid #ebedf3',
      // borderTop: '1px solid #ebedf3',
      '&:first-of-type': {
        // borderLeft: '1px solid #ebedf3',
      },
    },
    activeSortStyle: {
      '&:focus': {
        outline: 'none',
        color: '#3699FF',
      },
      '&:not(focus)': {
        color: '#3699FF',
      },
      '&:hover:not(:focus)': {
        color: '#3699FF',
      },
    },
    inactiveSortStyle: {
      '&:focus': {
        outline: 'none',
        color: '#B5B5C3',
      },
      '&:hover': {
        color: '#3699FF',
      },
    },
  },
};

export default customDataTableStyle;
