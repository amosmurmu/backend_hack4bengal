import multer from 'multer';
import express from 'express';
import {getAllRecords,createRecord,getRecordById,deleteRecord,updateRecord} from '../controllers/records.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Save "uploads/" folder

router.get('/records',getAllRecords);

router.post('/records', upload.single('file'),createRecord);

router.get('/records/:id', getRecordById);

router.delete('/records/:id', deleteRecord);

router.put('/record/:id', upload.single('file'), updateRecord);

export default router;
