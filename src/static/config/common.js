'use strict';

function mapSharedToBlogOnly(resource){
    var blogOnly = [
        'blogger',
        'registered',
        'anon'
    ];
    return mapSharedTo(blogOnly, resource);
}

function mapSharedTo(profile, resource){
    if(typeof resource === 'string'){
        return {
            local: resource,
            profile: profile
        };
    }else if(resource.profile === undefined){
        resource.profile = profile;
    }
    return resource;
}

module.exports = {
    profiles: [
        'dormant',
        'market',
        'available',
        'anon',
        'registered',
        'blogger'
    ],
    mapSharedTo: mapSharedTo,
    mapSharedToBlogOnly: mapSharedToBlogOnly
};