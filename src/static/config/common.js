function mapSharedProfileToBlogOnly(resource){
    var blogOnly = ['blogger', 'registered', 'anon'];

    if(typeof resource === 'string'){
        return {
            local: resource,
            profile: blogOnly
        };
    }else if(resource.profile === undefined){
        resource.profile = blogOnly;
    }
    return resource;
}

module.exports = {
    profiles: [
        'dormant',
        'available',
        'anon',
        'registered',
        'blogger'
    ],
    mapSharedProfileToBlogOnly: mapSharedProfileToBlogOnly
};