export const getLinkObject = (url: string): any => {
  return {
    url,
    type: 'ExternalLink',
    target: '_blank',
  };
};
