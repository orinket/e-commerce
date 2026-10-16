// src/components/DrawerRsuite.jsx
'use client';

import { Drawer } from 'rsuite';
import IISMethods from '../utils/IISMethods';
import { useAppSelector } from '../store/hooks';

const DrawerRsuite = (props) => {
  const modal = useAppSelector((state) => state.modal);

  // props.modalname se custom key lo, fallback 'filterdrawer'
  const modalname = props.modalname || 'filterdrawer';
  const controlled = Object.prototype.hasOwnProperty.call(props, 'open');
  const reduxOpen = !!modal[modalname];
  const isOpen = controlled ? !!props.open : reduxOpen;

  const handleClose = () => {
    if (controlled && typeof props.onClose === 'function') {
      props.onClose();
    } else {
      IISMethods.handleGrid(false, modalname, 0);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      placement={props.placement || 'right'}
      size={props.size || 'xs'}
      className={props.className}
    >
      {
        props.removeheader ?
          <></>
          :
          <Drawer.Header>
            <Drawer.Title>{props.title}</Drawer.Title>
          </Drawer.Header>
      }
      <Drawer.Body className={props.bodyClassName || ''}>{props.body}</Drawer.Body>
    </Drawer>
  );
};

export default DrawerRsuite;