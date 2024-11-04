import React from 'react';

function CheckBoxCustom(props) {
  const { value, id, handleClick } = props;

  return (
    <div className="CheckBoxCustom">
      <input
        type="checkbox"
        className="cursor-pointer"
        name={id}
        id={id}
        onClick={() => handleClick(id)}
      />
      <label htmlFor={id} className="cursor-pointer" onClick={() => handleClick(id)}>
        {value}
      </label>
      {/* <div className="ml-1">{value}</div> */}
    </div>
  );
}

export default CheckBoxCustom;
