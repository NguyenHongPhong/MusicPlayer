import fs from 'fs';
import multer from 'multer';
import express from 'express';
import path, { resolve } from 'path';
import morgan from 'morgan';
import { promises } from 'dns';

const resourcePath = '/public';
const __dirname = 'D:/learningLanguageProgram/MusicPlayer';
const localFolder = path.join(__dirname, './public/assets/FilesUploaded'); 
const app = express();
const port = 3000;

//Cấu hình Morgan để kiểm tra xem request đã gửi lên server chưa
app.use(morgan('combined'));

// Cấu hình Express để sử dụng resource
app.use(express.static(path.join(__dirname + resourcePath)));
// Cấu hình Express để phục vụ tệp tĩnh từ thư mục FilesUploaded
app.use('/FilesUploaded', express.static(path.join(__dirname, './public/assets/FilesUploaded')));

app.use('/updatedFiles', express.static(path.join(__dirname, './public/assets/updatedFiles')));

const fileUploadHandler = {
  
  // Tạo thư mục bất đồng bộ
  createFolder: async function() {
    try {
        await fs.promises.mkdir(localFolder, { recursive: true });
        const imagePath = path.join(localFolder, 'images');
        const musicPath = path.join(localFolder, 'musics');
        fileUploadHandler.createImageFolder(imagePath);
        fileUploadHandler.createMusicFolder(musicPath);
        return {imagePath, musicPath};
    } catch (error) {
        reject('Lỗi khi tạo thư mục');
    }
  },
  
  createImageFolder: async function(imgFolder) {
    try {
      await fs.promises.mkdir(imgFolder, { recursive: true });   
      console.log('Thư mục Image đã được tạo thành công!');   
    } catch (error) {
        console.error('Lỗi khi tạo thư mục Image:', error);
    }
  },

  createMusicFolder: async function(musicFolder) {
    try {
      await fs.promises.mkdir(musicFolder, { recursive: true });
      console.log('Thư mục Music đã được tạo thành công!');
    } catch (error) {
        console.error('Lỗi khi tạo thư mục Music:', error);
    }   
  },
  
  pathFolderSetting: async () => {
    try {
      const pathFolder = path.join(__dirname, './public/assets/updatedFiles');
      const imagesPath = pathFolder + '/images';
      const musicsPath = pathFolder + '/musics';
      await fs.promises.mkdir(pathFolder, { recursive: true });
      await fs.promises.mkdir(imagesPath, { recursive: true });
      await fs.promises.mkdir(musicsPath, { recursive: true });
      console.log('Tạo thư mục Cập nhật thành công !!');
      const parseObject = JSON.stringify({img: imagesPath, mus: musicsPath});
      
      const rs = await new Promise((resolve)=> {
        resolve(parseObject);
      });

      return rs;
  } catch (error) {
      console.log(error);
  }
  },

  storageUpdatingFiles: (objectPath) => {
    const parsePath = JSON.parse(objectPath);

    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        file.mimetype == 'image/jpeg' || file.mimetype === 'image/png' ? cb(null, parsePath.img) : cb(null, parsePath.mus)
      },
      filename: function(req, file, cb) {
        let enCoding = Buffer.from(file.originalname, 'latin1').toString('utf8');
        let convertedNameFile = enCoding.split('.');
        convertedNameFile.pop();
        let nameFile = convertedNameFile.join('').replace(/ /g, '&');;
        cb(null, nameFile + '-' + Date.now() + path.extname(file.originalname));  
      }
    });

    const uploadFilesUpdated = multer({ storage: storage});

    app.post('/update',   
      uploadFilesUpdated.fields([{ name: 'image-file', maxCount: 1 }, 
                                 { name: 'music-file', maxCount: 1 }]), 
    async (req, res, next) => {
       try {
         if (req.files) {
           const imageFile = req.files['image-file'] ? req.files['image-file'][0].filename : null;
           const musicFile = req.files['music-file'] ? req.files['music-file'][0].filename : null;

           res.status(201).json({
             message: 'Files updated successfully',
             image: imageFile, // Tên tệp 1
             music: musicFile  // Tên tệp 2          
           });
         } else {
           console.log('No files updated');
           res.status(400).json({
             message: 'No files updated'
           });
         }
       } catch (error) {
         console.error('Server error:', error);
         next(error);
       }
     })

  },
  setup: function(imgPath, musPath, app) {    
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        file.mimetype == 'image/jpeg' || file.mimetype === 'image/png' ? cb(null, imgPath) : cb(null, musPath)
      },
      filename: function(req, file, cb) {
        let enCoding = Buffer.from(file.originalname, 'latin1').toString('utf8');
        let convertedNameFile = enCoding.split('.');
        convertedNameFile.pop();
        let nameFile = convertedNameFile.join('');
        cb(null, nameFile + ' - ' + Date.now() + path.extname(file.originalname));  // Đặt tên file theo thời gian hiện tại
      }
    });

   const filer = (req, file, cb) => {
     var ext = path.extname(file.originalname);
      if( ext == '.jpeg' || ext === '.png' ||  ext === '.jpg' ) {
        cb(null, true) ;
      } else if (ext == '.mp3') {
        cb(null, true);
      } else {
        cb(new Error('Allowed only AUDIO and IMAGE files !!!'), false)
      }
   };

    const upload = multer({ storage: storage, fileFilter: filer });

    app.get('/', function(req, res) {    
      res.sendFile(path.join(__dirname, './index.html'));  // Đường dẫn tuyệt đối
    });

    // Định nghĩa endpoint /upload với POST
    app.post('/upload',
      upload.fields([{ name: 'image-file', maxCount: 1 }, { name: 'music-file', maxCount: 1 }]), // Nhận tệp ảnh
     async (req, res, next) => {
        try {
          if (req.files) {
            const imageFile = req.files['image-file'] ? req.files['image-file'][0].filename : null;
            const musicFile = req.files['music-file'] ? req.files['music-file'][0].filename : null;

            res.status(201).json({
              message: 'Files uploaded successfully',
              image: imageFile, // Tên tệp 1
              music: musicFile  // Tên tệp 2          
            });
          } else {
            console.log('No files uploaded');
            res.status(400).json({
              message: 'No files uploaded'
            });
          }
        } catch (error) {
          console.error('Server error:', error);
          next(error);
        }
      });

      app.post('/update', )

      app.use((err, req, res, next)=> {
           if(err) {
           return res.status(400).json({message: err.message});
         }
      })
  },
  start: async function() {
    try {
      const pathToFolder = await this.createFolder();
      this.setup(pathToFolder.imagePath, pathToFolder.musicPath, app);
      fileUploadHandler.pathFolderSetting().then((val) => fileUploadHandler.storageUpdatingFiles(val)
      )
    } catch (error) { 
      console.log(error);
    }
  }
};

// Khởi động handler upload
fileUploadHandler.start();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
