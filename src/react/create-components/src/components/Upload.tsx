/*
 * File: Upload.tsx
 * Description: 上传组件
 * Created: 2020-11-22 10:30:18
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React, {ChangeEvent, useRef, useState} from "react";
import axios from 'axios';

export type UploadFileStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface UploadFile {
  uid: string;
  size: number;
  name: string;
  status?: UploadFileStatus;
  percent?: number;
  raw?: File;
  response?: any;
  error?: any;
}

interface UploadProps {
  action: string;
  defaultFileList?: UploadFile[];
  beforeUpload?: (file: File) => boolean | Promise<File>;
  onProgress?: (percentage: number, file: File) => void;
  onSuccess?: (data: any, file: File) => void;
  onError?: (err: any, file: File) => void;
  onChange?: (file: File) => void;
  onRemove?: (file: UploadFile) => void;
  headers?: { [key: string]: any };
  name?: string;
  data?: { [key: string]: any };
  withCredentials?: boolean;
  accept?: string;
  multiple?: boolean;
  drag?: boolean;
}

const Upload: React.FunctionComponent<UploadProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>(props.defaultFileList || []);
  const fileInput = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }
    uploadFiles(files);
  }

  const uploadFiles = (file: FileList) => {
    let files = Array.from(file);
    files.forEach(file => {
      if (!props.beforeUpload) {
        post(file);
      } else {
        const result = props.beforeUpload(file);
        if (result && result instanceof Promise) {
          result.then((f) => {
            post(f);
          })
        } else if (result) {
          post(file);
        }
      }
    });
  }

  const post = (file: File) => {
    // 自定义的file格式
    let myFile: UploadFile = {
      name: file.name,
      percent: 0,
      raw: file,
      size: file.size,
      status: "ready",
      uid: Date.now() + "file"
    }
    setFileList((prevState) => {
      return [myFile, ...prevState];
    });
    const formData = new FormData();
    formData.append(props.name || 'file', file);
    if (props.data) {
      Object.keys(props.data).forEach((key) => {
        let t = (props.data) as any;
        formData.append(key, t[key]);
      });
    }

    axios
      .post(props.action, formData, {
        headers: {
          ...props.headers,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: props.withCredentials,
        onUploadProgress: (e) => {
          console.log(e);
          let percentage = Math.round((e.loaded * 100) / e.total) || 0;
          console.log(percentage);
          if (percentage < 100) {
            updateFileList(myFile, {percent: percentage, status: 'uploading'});
            if (props.onProgress) {
              props.onProgress(percentage, file);
            }
          }
        }
      })
      .then(response => {
        updateFileList(myFile, {status: 'success', response: response.data});
        if (props.onSuccess) {
          props.onSuccess(response.data, file);
        }
        if (props.onChange) {
          props.onChange(file);
        }
      })
      .catch(err => {
        updateFileList(myFile, {status: 'error', error: err});
        if (props.onError) {
          props.onError(err.data, file);
        }
        if (props.onChange) {
          props.onChange(file);
        }
      });
  }

  const updateFileList = (uploadFile: UploadFile, updateData: Partial<UploadFile>) => {
    setFileList(prevState => {
      return prevState.map((file) => {
        if (file.uid === uploadFile.uid) {
          return {...file, ...updateData};
        } else {
          return file;
        }
      })
    })
  }

  const removeFileList = (uploadFile: UploadFile) => {
    setFileList(prevState => {
      return prevState.filter(value => value.uid !== uploadFile.uid);
    })
  }

  const renderFileList = () => {
    return fileList.map(res => {
      return (
        <div key={res.uid}>
          <span>name:{res.name}/</span>
          <span>percentage:{res.percent}/</span>
          <span>status:{res.status}</span>
          <button onClick={() => removeFileList(res)}>移除</button>
        </div>
      );
    })
  }


  return (
    <div>
      <button onClick={handleClick}>Upload!</button>
      <input
        ref={fileInput}
        type="file"
        style={{display: "none"}}
        onChange={handleFileChange}
        multiple={props.multiple}
      />
      {renderFileList()}
    </div>
  )
}

export default Upload;
