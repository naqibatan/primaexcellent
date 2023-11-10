import FileUploaderComponent from '@wix/thunderbolt-elements/src/components/FileUploader/viewer/FileUploader';
import FileUploaderController from '@wix/thunderbolt-elements/src/components/FileUploader/viewer/FileUploader.controller';


const FileUploader = {
  component: FileUploaderComponent,
  controller: FileUploaderController
};


export const components = {
  ['FileUploader']: FileUploader
};

