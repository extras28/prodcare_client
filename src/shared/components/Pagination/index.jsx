import PropTypes from 'prop-types';
import { useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import AppData from 'shared/constants/AppData';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';

function Pagination({
  rowsPerPage = Global.gDefaultPagination,
  rowCount = 0,
  onChangePage = null,
  onChangeRowsPerPage = null,
  currentPage = 1,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ensure numeric values
  rowsPerPage = parseInt(rowsPerPage, 10);
  currentPage = parseInt(currentPage, 10);
  const totalPages = Math.ceil(rowCount / rowsPerPage);
  const iDisplayFrom = (currentPage - 1) * rowsPerPage + 1;
  let iDisplayTo = (currentPage - 1) * rowsPerPage + rowsPerPage;
  if (iDisplayTo > rowCount) {
    iDisplayTo = rowCount;
  }

  const arrButtons = [];
  let firstIndex = currentPage - 3 > 0 ? Math.min(currentPage - 3, totalPages - 5) : 0;
  let lastIndex = currentPage + 1 > totalPages - 1 ? totalPages - 1 : Math.max(currentPage + 1, 4);

  for (let i = firstIndex; i <= lastIndex; i++) {
    arrButtons.push(
      <button
        key={i}
        page={i + 1}
        onClick={handlePageChange}
        className={`btn btn-icon btn-sm border-0 btn-light mr-2 my-1 ${i === currentPage - 1 ? 'active btn-hover-primary' : ''}`}
      >
        {Utils.formatNumber(i + 1)}
      </button>
    );
  }

  function handlePageChange(e) {
    const newPage = e.target.getAttribute('page');
    const iNewPage = parseInt(newPage, 10);
    if (onChangePage && iNewPage !== currentPage) {
      onChangePage(iNewPage);
    }
  }

  const handlePerPageChange = (e) => {
    const value = e.target.innerText;
    const intValue = parseInt(value, 10);
    if (onChangeRowsPerPage && intValue) {
      onChangeRowsPerPage(intValue);
    }
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div className="d-flex flex-wrap py-2 mr-3">
          <button
            onClick={() => onChangePage && onChangePage(1)}
            className="btn btn-icon btn-sm btn-light btn-hover-primary mr-2 my-1"
            disabled={currentPage <= 1}
          >
            <i className="fad fa-angle-double-left icon-1x"></i>
          </button>
          <button
            onClick={() => onChangePage && onChangePage(currentPage - 1)}
            className="btn btn-icon btn-sm btn-light btn-hover-primary mr-2 my-1"
            disabled={currentPage <= 1}
          >
            <i className="fad fa-angle-left icon-1x"></i>
          </button>

          {arrButtons}

          <button
            onClick={() => onChangePage && onChangePage(currentPage + 1)}
            className="btn btn-icon btn-sm btn-light btn-hover-primary mr-2 my-1"
            disabled={currentPage >= totalPages}
          >
            <i className="fad fa-angle-right icon-1x"></i>
          </button>
          <button
            onClick={() => onChangePage && onChangePage(totalPages)}
            className="btn btn-icon btn-sm btn-light btn-hover-primary mr-2 my-1"
            disabled={currentPage >= totalPages}
          >
            <i className="fad fa-angle-double-right icon-1x"></i>
          </button>
        </div>

        <div className="d-flex align-items-center">
          <Dropdown isOpen={dropdownOpen} toggle={handleDropdownToggle} size="sm">
            <DropdownToggle
              caret
              className="d-flex align-items-center justify-content-between btn-light btn-hover-primary"
            >
              {rowsPerPage}
            </DropdownToggle>
            <DropdownMenu>
              {AppData.perPageItems.map((item, index) => (
                <DropdownItem
                  key={index}
                  active={item.value === rowsPerPage}
                  onClick={handlePerPageChange}
                >
                  {item.value}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  rowsPerPage: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
