import * as React from 'react';
import classNames from 'clsx';
import { customCssClasses } from '@wix/editor-elements-common-utils';
import { IFilesNameListProps } from '../../FileUploader.types';
import { testIds } from '../../constants';
import { FileName } from '../FileName/FileName';
import { getFileNameId } from '../utils';
import { usePrevious } from '../../../../providers/usePrevious';
import semanticClassNames from '../../FileUploader.semanticClassNames';
import style from './style/FilesNameList.scss';

export const FilesNameList: React.FunctionComponent<IFilesNameListProps> = ({
  parentCompId,
  skin,
  disabled,
  files,
  placeholderLabel,
  shouldShowValidityIndication,
  onFileRemoval,
  onXIconKeyDown,
  withPopperBehaviour,
  translations,
  fileType,
  setTextBellowButtonElem,
  updateLiveRegion,
  disableFileNameXIconFocus,
  scopedClassName,
}) => {
  const placeholder = !files.length ? placeholderLabel || ' ' : undefined;
  const isPlaceholder = !!placeholder;
  const uploadStatus = files && files[0]?.uploadStatus;
  const fileListClassName = classNames(
    style.fileList,
    style[skin],
    customCssClasses(semanticClassNames.fieldTitle),
    {
      [style.placeholder]: isPlaceholder,
    },
  );
  const [xIconElem, setXIconElem] = React.useState<HTMLElement | null>(null);

  const hasFile = files.length === 1;
  const [hasFileState, setHasFileState] = React.useState<boolean>(false);
  const prevHasFileState = usePrevious(hasFileState);

  React.useEffect(() => {
    setHasFileState(hasFile);
  }, [hasFile]);

  React.useEffect(() => {
    setTextBellowButtonElem(xIconElem);
  }, [setTextBellowButtonElem, xIconElem]);

  React.useEffect(() => {
    if (prevHasFileState !== hasFileState && hasFileState) {
      xIconElem?.focus();
    }
  }, [prevHasFileState, hasFileState, xIconElem]);

  return (
    <div
      className={fileListClassName}
      data-testid={testIds.fileList}
      aria-haspopup="false"
    >
      <FileName
        fileNameId={getFileNameId({ parentCompId, fileIndex: 0 })}
        placeholder={placeholder}
        file={!isPlaceholder ? files[0] : undefined}
        disabled={disabled}
        uploadStatus={uploadStatus}
        shouldShowValidityIndication={shouldShowValidityIndication}
        onFileRemoval={() => onFileRemoval(0)}
        onXIconKeyDown={e => onXIconKeyDown(0, e)}
        withPopperBehaviour={withPopperBehaviour}
        translations={translations}
        fileType={fileType}
        withSingleFileBehavior={hasFile}
        setXIconElem={setXIconElem}
        updateLiveRegion={updateLiveRegion}
        disableFileNameXIconFocus={disableFileNameXIconFocus}
        scopedClassName={scopedClassName}
      />
    </div>
  );
};
