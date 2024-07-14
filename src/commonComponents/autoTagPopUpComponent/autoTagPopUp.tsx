import {
    Box,
    Button,
    IconButton,
    Modal,
    Typography,
  } from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import {useState} from 'react';
import style from './autoTagPopUp.module.scss';

const AutoTagPopUp = ({ isOpen, toggle, onSubmitHandler, details }) => {
    const styles = {
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 3,
    };

    const [tags, setTags] = useState<string>();
  
    return (
      <Modal
        open={isOpen}
        onClose={toggle}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={styles} className={style.autoTagContainer}>
          <IconButton
            edge='end'
            color='inherit'
            onClick={toggle}
            aria-label='close'
            sx={{ position: 'absolute', top: 0, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          {/* <div className={style}>
            <Typography className={style.modalTitle}>
              <span style={{ color: 'black' }}>
                {'Auto-Tag'}
              </span>
            </Typography>
          </div> */}
          <div className={style.inputContainer}>
            <div className={style.leftBox}>  
              <Typography className={style.modalInput}>
                <span style={{ color: 'black'}}>Details: </span>
              </Typography>
              <Typography
                id='modal-modal-description'
                sx={{ mt: 2 }}
                className={style.modalInput}
                >
                <span style={{ color: 'black'}}>Tag: </span>
              </Typography>
            </div>
            <div className={style.rightBox}>
              <textarea
                disabled
                value={details}
              />
              <textarea
                onChange={(e) => setTags((e.target.value))}
              />
            </div>
          </div>
          <Button
            variant='contained'
            onClick={() => onSubmitHandler(details, tags)}
            style={{width:"fit-content", alignSelf:'center'}}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    )
  }

  export default AutoTagPopUp;