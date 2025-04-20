import { supabase } from './../config/db';
import cloudinary from '../config/cloudinary';
import { NextFunction, Request, Response } from 'express';

async function fetchRecordsFromDatabase() {
  try {
    const {data,error} = await supabase.from('records').select('*');
    if (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching records from database:', error); 
  }
}

export const createRecord = async (req: Request, res: Response,next:NextFunction):Promise<any> => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.body.user_id;
    const title = req.body.title;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : []; 

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path,{
      folder: 'records',
      resource_type: 'auto',
    });
    
    const fileUrl = result.secure_url;
    const fileType = result.resource_type;

    // Insert record into Supabase
    const { data, error } = await supabase
      .from('records')
      .insert([
        {
          user_id: userId,
          title,
          file_path: fileUrl,
          file_type: fileType,
          tags,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting record into Supabase:', error);
      return res.status(500).json({ message: 'Error inserting record into database' });
    }
    // Return the URL of the uploaded file
    return res.status(201).json({
      message: 'File uploaded and record created successfully',
      record : data[0]
    });

  } catch (error) {
    console.error('Error creating record:', error);
    next(error);
  }
};

export const getAllRecords = async (req: Request, res: Response): Promise<any> => {
  try {
    const records = await fetchRecordsFromDatabase();
    if (!records) {
      return res.status(404).json({ message: 'No records found' });
    }
    return res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return res.status(500).json({ message: 'Error fetching records' });
  }
};
export const deleteRecord = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('records')
      .delete()
      .eq('id', id)
      .select();
    if (error) {
      console.error('Error deleting record:', error);
      return res.status(404).json({ message: 'Record not found' });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    // Delete the file from Cloudinary
    const filePath = data[0].file_path;
    const publicId = filePath.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    return res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ message: 'Error deleting record' });
  }
};

export const getRecordById = async (req: Request, res: Response) :Promise<any> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching record:', error);
      return res.status(404).json({ message: 'Record not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching record:', error);
    return res.status(500).json({ message: 'Error fetching record' });
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const title = req.body.title;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const userId = req.body.user_id;

    const { data: existingData, error: fetchError } = await supabase
      .from('records')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({ message: 'Record not found' });
    }

    let fileUrl = existingData.file_path;
    let fileType = existingData.file_type;

    // If new file is uploaded, upload to Cloudinary and delete old file
    if (req.file) {
      // Upload new
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'records',
        resource_type: 'auto',
      });
      fileUrl = uploadResult.secure_url;
      fileType = uploadResult.resource_type;

      // Delete old
      const oldPublicId = existingData.file_path.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: 'auto',
      });
    }

    // Update record in Supabase
    const { data, error } = await supabase
      .from('records')
      .update({
        title,
        tags,
        file_path: fileUrl,
        file_type: fileType,
        user_id: userId,
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating record:', error);
      return res.status(500).json({ message: 'Error updating record' });
    }

    return res.status(200).json({
      message: 'Record updated successfully',
      record: data[0],
    });

  } catch (error) {
    console.error('Error updating record:', error);
    next(error);
  }
};

